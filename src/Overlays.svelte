<script type="ts">
	import { _ } from 'svelte-i18n'
	import { scale } from 'svelte/transition'
	import { quintOut } from 'svelte/easing'
	import OverlayCreator from './OverlayCreator.svelte'
	import OverlayList from './OverlayList.svelte'
	import OverlayItem from './OverlayItem.svelte'
	import type { OverlayInterface } from './interfaces/Overlay'

	import SplitPane from './components/SplitPane.svelte'

	export let overlays: Record<string, OverlayInterface> = {}
	export let currentOverlayUUID: string = ''
	let showOverlaySelection: boolean = false
	let showOverlayCreator: boolean = false

	function getCurrentOverlay(uuid: string): OverlayInterface | undefined {
		return overlays[uuid]
	}
	$: currentOverlay = getCurrentOverlay(currentOverlayUUID)
	
	function handleCreate(evt: CustomEvent<OverlayInterface>) {
		overlays[evt.detail.uuid] = evt.detail
		showOverlayCreator = false
		//console.log('okay, make', evt.detail)
	}

</script>

<main>
	<SplitPane type="horizontal" pos=20>
		<nav slot=a>
			{#if showOverlayCreator}
				<OverlayCreator bind:shown={showOverlayCreator} on:create={handleCreate} />
			{:else if currentOverlay === undefined}
				<OverlayList bind:showOverlayCreator={showOverlayCreator} bind:overlays={overlays} bind:currentOverlayUUID={currentOverlayUUID}/>
			{:else}
				<OverlayItem bind:overlay={currentOverlay} bind:uuid={currentOverlayUUID}/>
			{/if}
		</nav>
		<section slot=b style='width: 100%;'>
			{#if currentOverlay === undefined}
				{#if Object.entries(overlays).length > 0}
					{$_('overlays.selectOverlay')}
				{:else}
					{$_('overlays.createOverlay')}
				{/if}
			{:else}
				show it!
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
		border: 1px solid red;
		overflow-x: hidden;
		overflow-y: auto;
	}
	section {
		border: 1px solid blue;
	}
</style>