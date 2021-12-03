<script lang="ts" context="module">
	const eap = require('electron-app-settings')
	const { ipcRenderer } = require('electron')
	import Button from './components/Button.svelte'
	import Icon from './components/Icon.svelte'

	import { LitchServer } from './LitchServer'
	import { onMount } from 'svelte'
	import { register, init, isLoading, _ } from 'svelte-i18n'
	import type { OverlayInterface } from './interfaces/Overlay'
	import type { ModuleInterface } from './interfaces/Module'

	import { publisher } from './modules'
</script>

<script lang="ts">
	let overlays: Record<string, OverlayInterface> = {}
	let modules: Record<string, ModuleInterface> = {}
	let modulesMap: Record<string, string> = {}
	let currentOverlayUUID: string = ''
	let activeOverlayUUID: string = ''
	let litchServer: LitchServer = new LitchServer()
	let serverStatus: string = 'off'
	function getCurrentOverlay(uuid: string): OverlayInterface | undefined {
		return overlays[uuid]
	}

	$: currentOverlay = getCurrentOverlay(currentOverlayUUID)

	$: activeOverlayUUID ? litchServer.updateActiveOverlay(activeOverlayUUID) : null
	$: overlays ? litchServer.updateOverlays(overlays) : null
	$: modulesMap ? litchServer.updateModules(modulesMap) : null

	$: loading = true
	$: loadingMessage = ""

	litchServer.onclose = () => {
		console.log('got on close')
		serverStatus = 'off'
	}

	publisher.subscribe('module.*.fail', async ({sourceTopic}) => {
		console.log(sourceTopic)
	})
	publisher.subscribe('module.*.load', async ({sourceTopic}) => {
		console.log(sourceTopic)
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
		overlays = await eap.promises.get('overlays') || {}
		currentOverlayUUID = await eap.promises.get('currentOverlayUUID') || ''
		activeOverlayUUID = await eap.promises.get('activeOverlayUUID') || ''

		// Load modules (this should bes a separate model)
		loadingMessage = "Loading modules"
		const mods = await ipcRenderer.invoke('getModules')
		for (let mod of mods) {
			let fullmod = `/modules/${mod}/dist/index.js`
			let url = `../..${fullmod}`
			try {
				let m: ModuleInterface = (await import(url)).default as unknown as ModuleInterface
				modules[m.uuid] = m
				modulesMap[m.uuid] = fullmod
				publisher.publish('module.'+mod+'.load', {})
			} catch(e: any) {
				console.error(`error in ${mod}: ${e}`)
				publisher.publish('module.'+mod+'.fail', {})
			}
		}

		loading = false
	})

	import Overlays from './Overlays.svelte'
	import Settings from './Settings.svelte'
	let showSettings = false
	function toggleSettings() {
		showSettings = !showSettings
	}

	async function toggleServer() {
		console.log('pending')
		if (serverStatus === 'off') {
			serverStatus = 'pending'
			if (await litchServer.start()) {
				serverStatus = 'on'
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
		overlays = {
			...overlays
		}
		currentOverlayUUID = currentOverlayUUID
		activeOverlayUUID = activeOverlayUUID
	}

</script>

<nav>
	<h1>litch</h1>
	<menu>
		<Button primary disabled={serverStatus==='pending'} on:click={toggleServer}>
			<Icon icon={serverStatus==='on'?'stop':'start'}></Icon>
		</Button>
		<Button primary on:click={toggleSettings}>
			<Icon icon="settings"></Icon>
		</Button>
	</menu>
</nav>
<main>
	{#if !loading}
		{#if showSettings}
			<Settings/>
		{/if}
		<Overlays bind:overlays={overlays} bind:currentOverlayUUID={currentOverlayUUID} bind:activeOverlayUUID={activeOverlayUUID} on:refresh={handleRefresh} modules={modules}/>
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