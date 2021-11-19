<script lang="ts" context="module">
	const eap = require('electron-app-settings')
	const { ipcRenderer } = require('electron')

	import { LitchServer } from './LitchServer'
	import { onMount } from 'svelte'
	import { register, init, isLoading, _ } from 'svelte-i18n'
	import type { OverlayInterface } from './interfaces/Overlay'
	import type { ModuleInterface } from './interfaces/Module'
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

		// Load modules (this should be a separate model)
		loadingMessage = "Loading modules"
		const mod = 'dummy'
		let fullmod = `/modules/${mod}/dist/index.js`
		const url = `../..${fullmod}`
		let m: ModuleInterface = (await import(url)).default as unknown as ModuleInterface
		//let m: ModuleInterface = (await import('./modules/dummy/index.js')).default as unknown as ModuleInterface
		//let m: ModuleInterface = (await import('../modules/dummy/dist/index.js')).default as unknown as ModuleInterface
		console.log('oh', m)
		modules[m.uuid] = m
		modulesMap[m.uuid] = fullmod

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
		<button disabled={serverStatus==='pending'} on:click={toggleServer}>{serverStatus==='on'?'stop':'start'}</button>
		<button on:click={toggleSettings}>settings</button>
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
		background: #000000;
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		grid-template-rows: minmax(0, 1fr);
	}

	nav > h1 {
		color: #ff003e;
		font-size: 2em;
		font-weight: 900;
		margin: 0;
		padding: 0;
		background: #22FF00;
		background: linear-gradient(to bottom, #22FF00 0%, #D70FFF 40%, #22ff00 90%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		text-shadow: 0 0 .1em #d70fff;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>