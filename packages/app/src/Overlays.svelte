<script type="ts">
	import { _ } from 'svelte-i18n'
	import { scale } from 'svelte/transition'
	import { quintOut } from 'svelte/easing'
	import OverlayCreator from './OverlayCreator.svelte'
	import OverlayList from './OverlayList.svelte'
	import OverlayItem from './OverlayItem.svelte'
	import Overlay from './Overlay.svelte'
	import type { OverlayInterface } from './interfaces/Overlay'

	import SplitPane from './components/SplitPane.svelte'
	import Icon from './components/Icon.svelte'

	import type { ModuleInterface } from './interfaces/Module'
	import { onMount } from 'svelte'
	import { publisher } from './modules'
	import type { Subscriber } from '@kettek/pubsub/dist/Subscriber'
	import { addOverlay, removeOverlay, overlays, refreshOverlays, duplicateOverlay } from './stores/overlays'
	import ModuleWrapper from './ModuleWrapper.svelte'
	import { modules } from './stores/modules'
  import { createAssetManager } from './assets'
  import type { AssetManager } from './interfaces/Asset'

	//export let overlays: Record<string, OverlayInterface> = {}
	export let litchURL: string = ''
	export let currentOverlayUUID: string = ''
	export let activeOverlayUUID: string = ''
	export let focusedOverlayUUID: string = ''
	let showOverlaySelection: boolean = false
	let showOverlayCreator: boolean = false

	// Global assets manager passed to all module instance components.
	let assets: AssetManager = createAssetManager()

	let activeOverlay: OverlayInterface
	$: currentOverlay = $overlays[currentOverlayUUID]
	$: activeOverlay = $overlays[activeOverlayUUID]
	$: focusedOverlay = $overlays[focusedOverlayUUID]
	$: displayedOverlay = focusedOverlay || activeOverlay

	function handleCreate(evt: CustomEvent<OverlayInterface>) {
		addOverlay(evt.detail)

		//overlays[evt.detail.uuid] = evt.detail
		showOverlayCreator = false
	}
	function handleDelete(evt: CustomEvent<string>) {
		removeOverlay(evt.detail)
		//delete overlays[evt.detail]
		if (activeOverlayUUID === evt.detail) {
			activeOverlayUUID = ''
		}
		if (currentOverlayUUID === evt.detail) {
			currentOverlayUUID = ''
		}
	}
	function handleDuplicate(evt: CustomEvent<string>) {
		duplicateOverlay(evt.detail)
	}

	let assetsSubscriber: Subscriber
	onMount(() => {
		assetsSubscriber = publisher.subscribe('overlay.*.assets', async ({topic, message}) => {
			console.log('overlay assets', topic, message)
		})
	})
</script>

<main>
	<SplitPane type="horizontal" pos=20>
		<nav slot=a>
			{#if showOverlayCreator}
				<OverlayCreator bind:shown={showOverlayCreator} on:create={handleCreate} />
			{:else if currentOverlay === undefined}
				<OverlayList litchURL={litchURL} bind:showOverlayCreator={showOverlayCreator} bind:overlays={$overlays} bind:currentOverlayUUID={currentOverlayUUID} bind:activeOverlayUUID={activeOverlayUUID} bind:focusedOverlayUUID={focusedOverlayUUID} on:delete={handleDelete} on:duplicate={handleDuplicate}/>
			{:else}
				<OverlayItem bind:overlay={currentOverlay} bind:uuid={currentOverlayUUID} on:delete={handleDelete} modules={$modules}/>
			{/if}
		</nav>
		<section slot=b style='width: 100%;'>
			{#if displayedOverlay === undefined}
				{#if Object.entries(overlays).length > 0}
					{$_('overlays.activateOverlay')}
				{:else}
					{$_('overlays.createOverlay')}
				{/if}
			{:else}
				<Overlay bind:overlay={displayedOverlay} modules={$modules} active={displayedOverlay === activeOverlay} />
			{/if}
		</section>
	</SplitPane>
</main>
<!-- Create activeComponent for all active modules in the activeOverlay -->
<aside>
	{#if activeOverlay}
		{#each activeOverlay.modules as module}
			{#if module.active && $modules[module.moduleUUID]?.instanceComponent}
				<ModuleWrapper this={$modules[module.moduleUUID].instanceComponent} assets={assets} settings={module.settings} bind:live={module.live} channel={module.instanceChannel} services={module.servicesChannel} format={(messageId, options) => $_(`modules.${module.moduleUUID}.${messageId}`, options)} update={(value)=>{module.settings = value;refreshOverlays();module.channels.publish('update', module.settings)}} />
			{/if}
		{/each}
	{/if}
	{#if focusedOverlay && activeOverlay !== focusedOverlay}
		{#each focusedOverlay.modules as module}
			{#if module.active && $modules[module.moduleUUID]?.instanceComponent}
				<ModuleWrapper this={$modules[module.moduleUUID].instanceComponent} assets={assets} settings={module.settings} bind:live={module.live} channel={module.instanceChannel} services={module.servicesChannel} format={(messageId, options) => $_(`modules.${module.moduleUUID}.${messageId}`, options)} update={(value)=>{module.settings = value;refreshOverlays();module.channels.publish('update', module.settings)}} />
			{/if}
		{/each}
	{/if}
</aside>

<style>
	main {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: minmax(0, 1fr);
		width: 100%;
		height: 100%;
	}
	nav {
		position: relative;
		background: var(--nav-bg);
		color: #333;
		overflow-x: hidden;
		overflow-y: auto;
	}
	section {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: minmax(0, 1fr);
	}
	aside {
		display: none;
	}
</style>