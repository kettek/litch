<script type="ts">
	import { _ } from 'svelte-i18n'
	import { fly } from 'svelte/transition';
	import { quintInOut } from 'svelte/easing';

	import type { OverlayInterface } from './interfaces/Overlay'
    export let currentOverlayUUID: string
	export let overlays: Record<string, OverlayInterface> = {}
	export let showOverlayCreator: boolean
</script>

<main transition:fly="{{delay: 0, duration: 200, x: -500, y: 0, easing: quintInOut}}">
	<button on:click={() => showOverlayCreator = true}>{$_('overlays.buttonNewOverlay')}</button>
	{#each Object.entries(overlays) as [uuid, overlay] }
		<button title="{uuid}" on:click={() => currentOverlayUUID=uuid}>{overlay.title}</button>
	{/each}
</main>

<style>
    main {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: stretch;
        justify-content: flex-start;
        flex-direction: column;
    }
</style>