<script type="ts">
	import { onMount } from 'svelte'
	import { fly } from 'svelte/transition';
	import { _ } from 'svelte-i18n'
	import { quintInOut } from 'svelte/easing';
	import { createEventDispatcher } from 'svelte'
	import { v4 } from 'uuid';
	import type { OverlayInterface } from './interfaces/Overlay'
	import type { BoxInterface } from './interfaces/Box'
	const { ipcRenderer } = require('electron')

	export let shown: boolean
	let title: string
	let width: number
	let height: number
	const dispatch = createEventDispatcher<OverlayInterface>()

	onMount(async () => {
		const dimensions = await ipcRenderer.invoke('getDisplaySize') as BoxInterface
		width = dimensions.width
		height = dimensions.height
	})

	function createOverlay() {
		dispatch('create', {
			title: title||'unnamed',
			uuid: v4(),
			canvas:
			{
	x: 0,
	y: 0,
	width: width||1920,
	height: height||1080
			},
			modules: [],
			openModules: true,
			openSettings: true,
		} as OverlayInterface)
	}
</script>

<main transition:fly="{{delay: 0, duration: 200, x: 500, y: 0, easing: quintInOut}}">
	<nav>
		<button on:click={()=>shown=false}>back</button>
		<header>{$_('overlays.titleCreateOverlay')}</header>
	</nav>
	<section>
		<label>
			<input type='text' placeholder='title' bind:value={title}>
			<span>Title</span>
		</label>
		<label>
			<input type='number' placeholder='1920' bind:value={width}>
			<span>Width</span>
		</label>
		<label>
			<input type='number' placeholder='1080' bind:value={height}>
			<span>Height</span>
		</label>
		<button on:click={createOverlay}>
			create
		</button>
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
		background: var(--secondary);
		color: var(--text);
	}
	nav > button {
		height: 100%;
		background: none;
		border: 0;
		border-radius: 0;
		color: var(--text);
	}
	section {
		color: var(--secondary);
		padding: .5em;
	}
	header {
		font-weight: 600;
		display: flex;
		align-items: center;
		padding-left: .5em;
		user-select: none;
	}
	label {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
	}
	label span {
		font-weight: 500;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 .5em;
	}
</style>