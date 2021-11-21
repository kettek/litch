<script type="ts">
	import { _ } from 'svelte-i18n'
	import { fly } from 'svelte/transition';
	import { quintInOut } from 'svelte/easing';

	import type { OverlayInterface } from './interfaces/Overlay'
    export let currentOverlayUUID: string
    export let activeOverlayUUID: string
    export let focusedOverlayUUID: string
	export let overlays: Record<string, OverlayInterface> = {}
	export let showOverlayCreator: boolean
</script>

<main transition:fly="{{delay: 0, duration: 200, x: -500, y: 0, easing: quintInOut}}">
	<button on:click={() => showOverlayCreator = true} class='nav__heading' >{$_('overlays.buttonNewOverlay')}</button>
	{#each Object.entries(overlays) as [uuid, overlay] }
		<li class:focused={focusedOverlayUUID===uuid} class:active={activeOverlayUUID===uuid} title="{uuid}">
            <span on:click={() => focusedOverlayUUID=uuid} on:dblclick={() => currentOverlayUUID=uuid}>
                {overlay.title}
            </span>
            <button on:click={() => activeOverlayUUID=uuid}>
                {activeOverlayUUID===uuid?'actived':'activate'}
            </button>
        </li>
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
    li {
        list-style: none;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        border: 1px solid transparent;
    }
    li.active {
        border: 1px solid gold;
    }
    li.focused {
        background: rgba(128, 128, 128, 0.5);
    }
</style>