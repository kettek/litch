<script lang="ts" context="module">
	const eap = require('electron-app-settings')
	const { ipcRenderer } = require('electron')

	import { onMount } from 'svelte'
	import { register, init, isLoading, _ } from 'svelte-i18n'
	import YAML from 'yaml'
	import type { OverlayInterface } from './interfaces/Overlay';
</script>

<script lang="ts">
	let overlays: Record<string, OverlayInterface> = {}
	let currentOverlayUUID: string = ''
	function getCurrentOverlay(uuid: string): OverlayInterface | undefined {
		return overlays[uuid]
	}

	$: currentOverlay = getCurrentOverlay(currentOverlayUUID)

	$: loading = true
	$: loadingMessage = ""

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

		loading = false
	})

	import Overlays from './Overlays.svelte'
	import Settings from './Settings.svelte'
	let showSettings = false
	function toggleSettings() {
		showSettings = !showSettings
	}
</script>

<nav>
	<h1>litch</h1>
	<button on:click={toggleSettings}>settings</button>
</nav>
<main>
	{#if !loading}
		{#if showSettings}
			<Settings/>
		{/if}
		<Overlays bind:overlays={overlays} bind:currentOverlayUUID={currentOverlayUUID} />
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