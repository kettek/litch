<script type="ts">
	import { fly } from 'svelte/transition'
	import { _ } from 'svelte-i18n'
	import { quintInOut } from 'svelte/easing'
	import type { OverlayInterface } from './interfaces/Overlay'

	export let overlay: OverlayInterface
	export let uuid: string
</script>

<main transition:fly="{{delay: 0, duration: 200, x: 500, y: 0, easing: quintInOut}}">
	<nav>
		<button on:click={()=>uuid=''}>back</button>
		<header>{overlay.title}</header>
	</nav>
	<section>
		<label>
			<input type='text' placeholder='title' bind:value={overlay.title}>
			<span>Title</span>
		</label>
		<label>
			<input type='number' placeholder='1920' bind:value={overlay.canvas.width}>
			<span>Width</span>
		</label>
		<label>
			<input type='number' placeholder='1080' bind:value={overlay.canvas.height}>
			<span>Height</span>
		</label>
	</section>
</main>

<style>
	main {
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: auto minmax(0, 1fr);
	}
	nav {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: stretch;
		justify-content: stretch;
	}
	header {
		font-size: 150%;
		font-weight: 600;
		display: flex;
		align-items: center;
		padding-left: .5em;
	}
</style>