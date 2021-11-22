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
	<ul>
	    {#each Object.entries(overlays) as [uuid, overlay] }
	    	<li class:focused={focusedOverlayUUID===uuid} class:active={activeOverlayUUID===uuid} title="{uuid}">
	    		<span on:click={() => focusedOverlayUUID=uuid} on:dblclick={() => currentOverlayUUID=uuid}>
	    			{overlay.title}
	    		</span>
	    		<button class='activator' class:active={activeOverlayUUID===uuid} on:click={() => activeOverlayUUID=uuid}>
	    			⭐
	    		</button>
	    	</li>
	    {/each}
	</ul>
</main>

<style>
	main {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
        display: grid;
        grid-template-rows: auto minmax(0, 1fr);
        grid-template-columns: minmax(0, 1fr);
	}
	main > button {
		width: 100%;
		height: 100%;
		background: var(--secondary);
		color: var(--text);
		border: 0;
		border-radius: 0;
	}
	.activator {
		background: none;
		border: 0;
		border-radius: 0;
		color: var(--text);
		padding: 0;
		margin: 0;
		font-size: 150%;
	}
	.activator.active {
		color: gold;
	}
	ul {
		margin: 0;
		padding: 0;
	}
	li {
		list-style: none;
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		grid-template-rows: minmax(0, 1fr);
		align-items: center;
		border: 1px solid transparent;
		color: var(--secondary);
		padding-left: 1em;
	}
	li.active {
		border: 1px solid gold;
	}
	li.focused {
		background: rgba(128, 128, 128, 0.5);
	}
</style>