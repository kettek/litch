<script lang="ts" context="module">
	const eap = require('electron-app-settings')
	const { ipcRenderer } = require('electron')
	import Button from './components/Button.svelte'
	import Icon from './components/Icon.svelte'

	import { LitchServer } from './LitchServer'
	import { onMount } from 'svelte'
	import { register, init, isLoading, _, addMessages } from 'svelte-i18n'
	import type { OverlayInterface } from './interfaces/Overlay'
	import type { ModuleInterface } from './interfaces/Module'
	import type { Asset } from './interfaces/Asset'

	import { httpReference, start as startAssets } from './assets'

	import { settings } from './stores/settings'
	import { overlays } from './stores/overlays'
	import { services } from './stores/services'

	import { publisher } from './modules'
</script>

<script lang="ts">
	let assets: Asset[] = []
	let modules: Record<string, ModuleInterface> = {}
	let modulesMap: Record<string, string> = {}
	let serviceSources: ServiceSourceInterface[] = []
	let currentOverlayUUID: string = ''
	let litchServer: LitchServer = new LitchServer($settings.port)
	let serverStatus: string = 'off'
	function getCurrentOverlay(uuid: string): OverlayInterface | undefined {
		return $overlays[uuid]
	}

	$: currentOverlay = getCurrentOverlay(currentOverlayUUID)

	$: $settings.activeOverlay ? litchServer.updateActiveOverlay($settings.activeOverlay) : null
	$: $overlays ? litchServer.updateOverlays($overlays) : null
	$: modulesMap ? litchServer.updateModules(modulesMap) : null
	$: $settings.port ? litchServer.changePort($settings.port) : null

	$: loading = true
	$: loadingMessage = ""

	litchServer.onclose = () => {
		console.log('got on close')
		serverStatus = 'off'
	}
	litchServer.onactivate = uuid => {
		switchActiveOverlay(uuid)
	}

	publisher.subscribe('module.*.fail', async ({sourceTopic}) => {
		console.log(sourceTopic)
	})
	publisher.subscribe('module.*.load', async ({sourceTopic}) => {
		console.log(sourceTopic)
	})

	let serviceEndpoint = publisher.connect('service.*', async (r: EndpointMessage): Promise<number> => {
		ipcRenderer.invoke('publish', r)
		return 0
	})

	onMount(async () => {
		loadingMessage = "Gathering basic information"
		const appDir = await ipcRenderer.invoke('getPath', 'userData')
		const locale = await ipcRenderer.invoke('getLocale')

		// Load settings.
		loadingMessage = "Loading settings"
		await eap.promises.set('timestamp', Date.now())

		// Setup localization.
		loadingMessage = "Setting up localization"
		register('en', () => import('../locales/en.json'))
		await init({
			fallbackLocale: 'en',
			initialLocale: locale,
		})

		// Populate structures.
		loadingMessage = "Populating structures"
		//$overlays = await eap.promises.get('overlays') || {}
		currentOverlayUUID = await eap.promises.get('currentOverlayUUID') || ''

		// Load services
		loadingMessage = "Winding services"
		serviceSources = await ipcRenderer.invoke('getServices')
		let servicesToEnable : ServiceInterface[] = []
		for (let service of serviceSources) {
			await ipcRenderer.invoke('loadService', service.uuid)
			let full = `/services/${service.dir}/${service.render}`
			let url = `../../../..${full}`
			try {
				let s: ServiceInterface = (await import(url)).default as unknown as ServiceInterface
				addService({
					...s,
					uuid: service.uuid,
				})
				publisher.publish('service.'+service.uuid+'.load', {})

				// Send settings state.
				let ss = get(services)
				let realService = ss.find(v=>v.uuid === service.uuid)
				if (realService) {
					publisher.publish('service.'+service.uuid+'.update', realService.settings)
					servicesToEnable.push(realService)
				}

				if (s.locales) {
					for (let [lang, dictionary] of Object.entries(s.locales)) {
						let o = {
							'service': {}
						} as any
						o.service[service.uuid] = dictionary
						addMessages(lang, o)
					}
				}

			} catch(e: any) {
				console.error(`error in ${service}: ${e}`)
				publisher.publish('service.'+service+'.fail', {})
			}
		}
		for (let service of servicesToEnable) {
			publisher.publish(`service.${service.uuid}.enable`, {})
		}

		// Load modules (this should bes a separate model)
		loadingMessage = "Loading modules"
		const mods = await ipcRenderer.invoke('getModules')
		for (let mod of mods) {
			let fullmod = `/modules/${mod}/dist/index.js`
			let url = `../../../..${fullmod}`
			try {
				let m: ModuleInterface = (await import(url)).default as unknown as ModuleInterface
				modules[m.uuid] = m
				modulesMap[m.uuid] = fullmod
				// TODO: It'd be nice to have locales be unloadable but I don't know if svelte-i18n supports that.
				if (m.locales) {
					for (let [lang, dictionary] of Object.entries(m.locales)) {
						let o = {
							'modules': {}
						} as any
						o.modules[m.uuid] = dictionary
						addMessages(lang, o)
					}
				}
				publisher.publish('module.'+mod+'.load', {})
			} catch(e: any) {
				console.error(`error in ${mod}: ${e}`)
				publisher.publish('module.'+mod+'.fail', {})
			}
		}

		// Start up assets server
		loadingMessage = "Chuffing assets"
		await startAssets()

		loadingMessage = "Spinning server"
		await toggleServer()

		loading = false
	})

	import Overlays from './Overlays.svelte'
	import Settings from './Settings.svelte'
	let showSettings = false
	function toggleSettings() {
		showSettings = !showSettings
	}

	import Collections from './Collections.svelte'
	import Window from './components/Window.svelte'
	let showAssets = false
	function toggleAssets() {
		showAssets = !showAssets
	}

	import Services from './Services.svelte'
	import { addService, removeService } from './stores/services'
	import type { ServiceInterface, ServiceSourceInterface } from './interfaces/Service'
	import type { EndpointMessage } from '@kettek/pubsub/dist/Endpoint'
	import { get } from 'svelte/store'
	let showServices = false
	function toggleServices() {
		showServices = !showServices
	}

	async function toggleServer() {
		console.log('pending')
		if (serverStatus === 'off') {
			serverStatus = 'pending'
			if (await litchServer.start()) {
				serverStatus = 'on'
				// Always let the server know of our current file redirect reference after start.
				publisher.publish('collections.reference', httpReference)
			} else {
				serverStatus = 'off'
			}
		} else if (serverStatus === 'on') {
			serverStatus = 'pending'
			if (!await litchServer.stop()) {
				serverStatus = 'off'
			} else {
				serverStatus = 'on'
			}
		}
	}

	function handleRefresh(evt: CustomEvent<string>) {
		$overlays = {
			...$overlays
		}
		currentOverlayUUID = currentOverlayUUID
		$settings.activeOverlay = $settings.activeOverlay
	}

	function switchActiveOverlay(uuid: string) {
		if ($overlays[uuid]) {
			$settings.activeOverlay = uuid
		}
	}

</script>

<nav>
	<h1>litch</h1>
	<menu>
		{#if !loading}
			<Button primary on:click={toggleAssets} title={$_('litch.openCollections')}>
				<Icon icon="assets"></Icon>
			</Button>
			<Button primary on:click={toggleServices} title={$_('litch.openServices')}>
				<Icon icon="service"></Icon>
			</Button>
			<Button primary disabled={serverStatus==='pending'} on:click={toggleServer} title={serverStatus==='on'?$_('litch.stopServer'):$_('litch.startServer')}>
				<Icon icon={serverStatus==='on'?'stop':'start'}></Icon>
			</Button>
			<Button title={$_('overlays.obsSourceDragger')} primary invert disabled={serverStatus!=='on'} draggable={true} on:dragstart={e => {
				let width = 1920
				let height = 1080
				let o = $overlays[$settings.activeOverlay]
				if (o) {
					width = o.canvas.width
					height = o.canvas.height
				}
				let url = `${litchServer.url}?layer-name=Litch&layer-width=${width}&layer-height=${height}`
				e.dataTransfer?.setData('text/uri-list', url)
				e.dataTransfer?.setData('text/plain', url)
			}}>
				<Icon icon='link'></Icon>
			</Button>
			<Button primary on:click={toggleSettings} title={$_('litch.openSettings')}>
				<Icon icon="settings"></Icon>
			</Button>
		{/if}
	</menu>
</nav>
<main>
	{#if !loading}
		{#if showAssets}
			<Collections on:close={()=>showAssets=false}/>
		{/if}
		{#if showServices}
			<Window primary on:close={()=>showServices=false}>
				<span slot='title'>{$_('services.title')}</span>
				<article slot='content'>
					<Services/>
				</article>
			</Window>
		{/if}
		{#if showSettings}
			<Settings/>
		{/if}
		<Overlays litchURL={litchServer.url} bind:currentOverlayUUID={currentOverlayUUID} bind:activeOverlayUUID={$settings.activeOverlay} on:refresh={handleRefresh} modules={modules}/>
	{:else}
		{loadingMessage}
	{/if}
</main>

<style>
	main {
		width: 100%;
		height: 100%;
		background: #001122;
	}

	nav {
		background: var(--bar-bg);
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		grid-template-rows: minmax(0, 1fr);
		padding: .5em;
	}

	nav > h1 {
		color: var(--primary);
		font-size: 200%;
		font-weight: 900;
		margin: 0;
		padding: 0;
		display: flex;
		align-items: center;
	}

	menu {
		margin: 0;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>