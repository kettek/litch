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

	import Button from './components/Button.svelte'
	import Icon from './components/Icon.svelte'
	import Card from './components/Card.svelte'

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
			canvas: {
				x: 0,
				y: 0,
				width: width||1920,
				height: height||1080
			},
			modules: [],
			openSettings: true,
			openAvailableModules: true,
			openActiveModules: true,
			activeModuleUUID: '',
		} as OverlayInterface)
	}
</script>

<Card secondary bind:open={shown}>
	<svelte:fragment slot='title'>{$_('overlays.titleCreateOverlay')}</svelte:fragment>
	<section slot='content'>
		<label>
			<input type='text' placeholder='title' bind:value={title}>
			<span>{$_('overlays.title')}</span>
		</label>
		<label>
			<input type='number' placeholder='1920' bind:value={width}>
			<span>{$_('overlays.width')}</span>
		</label>
		<label>
			<input type='number' placeholder='1080' bind:value={height}>
			<span>{$_('overlays.height')}</span>
		</label>
	</section>
	<svelte:fragment slot='footer'>
		<Button secondary on:click={createOverlay}>
			<Icon icon='add'></Icon>
		</Button>
	</svelte:fragment>
</Card>

<style>
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
		min-width: 8ch;
	}
	section {
		padding: 1em;
	}
</style>