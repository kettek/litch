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

	import type { ModuleInterface } from './interfaces/Module'
	export let modules: Record<string, ModuleInterface> = {}

	export let overlays: Record<string, OverlayInterface> = {}
	export let currentOverlayUUID: string = ''
	export let activeOverlayUUID: string = ''
	export let focusedOverlayUUID: string = ''
	let showOverlaySelection: boolean = false
	let showOverlayCreator: boolean = false

	$: currentOverlay = overlays[currentOverlayUUID]
	$: activeOverlay = overlays[activeOverlayUUID]
	$: focusedOverlay = overlays[focusedOverlayUUID]
	$: displayedOverlay = focusedOverlay || activeOverlay
	
	function handleCreate(evt: CustomEvent<OverlayInterface>) {
		overlays[evt.detail.uuid] = evt.detail
		showOverlayCreator = false
	}
	function handleDelete(evt: CustomEvent<string>) {
		delete overlays[evt.detail]
		if (activeOverlayUUID === evt.detail) {
			activeOverlayUUID = ''
		}
		if (currentOverlayUUID === evt.detail) {
			currentOverlayUUID = ''
		}
	}
</script>

<main>
	<SplitPane type="horizontal" pos=20>
		<nav slot=a>
			{#if showOverlayCreator}
				<OverlayCreator bind:shown={showOverlayCreator} on:create={handleCreate} />
			{:else if currentOverlay === undefined}
				<OverlayList bind:showOverlayCreator={showOverlayCreator} bind:overlays={overlays} bind:currentOverlayUUID={currentOverlayUUID} bind:activeOverlayUUID={activeOverlayUUID} bind:focusedOverlayUUID={focusedOverlayUUID}/>
			{:else}
				<OverlayItem bind:overlay={currentOverlay} bind:uuid={currentOverlayUUID} on:delete={handleDelete} on:refresh modules={modules}/>
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
				<Overlay bind:overlay={displayedOverlay} modules={modules} on:refresh active={displayedOverlay === activeOverlay} />
			{/if}
		</section>
	</SplitPane>
</main>

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
</style>