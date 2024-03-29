<script type="ts">
	import { _ } from 'svelte-i18n'
	import { fly } from 'svelte/transition';
	import { flip } from 'svelte/animate'
	import { quintInOut } from 'svelte/easing';

	import Card from './components/Card.svelte'
	import Button from './components/Button.svelte'
	import Icon from './components/Icon.svelte'
	import type { OverlayInterface } from './interfaces/Overlay'
	export let litchURL: string = ''
	export let currentOverlayUUID: string
	export let activeOverlayUUID: string
	export let focusedOverlayUUID: string
	export let overlays: Record<string, OverlayInterface> = {}
	export let showOverlayCreator: boolean

	// Drag and drop support.
	let hoveringOverlayUUID: string
	let fromOverlayUUID: string
	function handleOverlayDragStart(e: DragEvent, uuid: string) {
		if (!e.dataTransfer) return
		e.dataTransfer.effectAllowed = 'move'
		e.dataTransfer.dropEffect = 'move'
		fromOverlayUUID = uuid
	}
	function handleOverlayDrop(e: DragEvent, targetUUID: string) {
		if (!e.dataTransfer) return
		e.dataTransfer.dropEffect = 'move'

		const from = overlays[fromOverlayUUID]
		const to = overlays[hoveringOverlayUUID]

		overlays[fromOverlayUUID] = to
		overlays[hoveringOverlayUUID] = from
		overlays = {...overlays}
		fromOverlayUUID = ''
	}

	// Menu stuff
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher<string>()

	import Menu from './components/Menu.svelte'
	import MenuOption from './components/MenuOption.svelte'
	let menuPos = {x: 0, y: 0}
	let menuUUID: string
	let showMenu = false
	async function showOverlayMenu(e: MouseEvent, uuid: string) {
		menuUUID = uuid
		e.preventDefault()
		e.stopPropagation()
		if (showMenu) {
			showMenu = false
			await new Promise(res => setTimeout(res, 100));
		}
		menuPos = { x: e.clientX, y: e.clientY }
		showMenu = true
	}
	function closeOverlayMenu() {
		showMenu = false
	}
	function deleteOverlay(uuid: string) {
		delete overlays[uuid]
	}
</script>

<Card secondary noBack flyX={-500}>
	<button slot='title' on:click={() => showOverlayCreator = true} class='nav__heading' >{$_('overlays.buttonNewOverlay')}</button>
	<ul slot='content'>
		{#each Object.entries(overlays) as [uuid, overlay] (uuid)}
			<li
				class:active={activeOverlayUUID===uuid} title="{uuid}"
				animate:flip="{{duration: 200}}"
				draggable={true}
				on:dragstart={e => handleOverlayDragStart(e, uuid)}
				on:drop|preventDefault={e => handleOverlayDrop(e, uuid)}
				ondragover="return false"
				on:dragenter={() => hoveringOverlayUUID = uuid}
				class:hover={hoveringOverlayUUID === uuid}
			>
				<button class='activator' class:active={activeOverlayUUID===uuid} on:click={() => activeOverlayUUID=uuid} title={activeOverlayUUID===uuid?$_('overlay.inactivate'):$_('overlay.activate')}>
					<Icon icon={activeOverlayUUID===uuid?'active':'inactive'}></Icon>
				</button>
				<span on:click={() => {currentOverlayUUID=uuid;focusedOverlayUUID=uuid}}>
					{overlay.title}
				</span>
				<Button title={$_('overlays.obsActivatorSourceDragger')} secondary invert draggable={true} on:dragstart={e => {
					let width = 1920
					let height = 1080
					let o = overlays[uuid]
					if (o) {
						width = o.canvas.width
						height = o.canvas.height
					}
					let url = `${litchURL}/overlays/${uuid}?layer-name=Litch (${o.title})&layer-width=${width}&layer-height=${height}`
					e.dataTransfer?.setData('text/uri-list', url)
					e.dataTransfer?.setData('text/plain', url)
				}}>
					<Icon icon='link'></Icon>
				</Button>
				<Button secondary invert on:click={(e)=>showOverlayMenu(e, uuid)}><Icon icon='burger'></Icon></Button>
			</li>
		{/each}
	</ul>
</Card>
{#if showMenu}
	<Menu secondary {...menuPos} on:click={closeOverlayMenu} on:clickoutside={closeOverlayMenu}>
		<MenuOption tertiary on:click={()=>dispatch('duplicate', menuUUID)}>
			<span>{$_('overlays.duplicate')}</span>
			<Icon icon='duplicate'></Icon>
		</MenuOption>
		<MenuOption dangerous on:click={()=>dispatch('delete', menuUUID)}>
			<span>Delete</span>
			<Icon icon='delete'></Icon>
		</MenuOption>
	</Menu>
{/if}

<style>
	button {
		width: 100%;
		height: 100%;
	}
	.activator {
		background: none;
		border: 0;
		border-radius: 0;
		color: var(--text);
		padding: 0;
		margin: 0;
		font-size: 150%;
		cursor: pointer;
	}
	.activator.active {
		color: var(--secondary);
	}
	ul {
		margin: 0;
		padding: 0;
	}
	li {
		list-style: none;
		display: grid;
		grid-template-columns: 3em minmax(0, 1fr) auto auto;
		grid-template-rows: minmax(0, 1fr);
		align-items: stretch;
		border: 1px solid transparent;
		color: var(--secondary);
	}
	li.focused {
		background: rgba(128, 128, 128, 0.5);
	}
	li > span {
		display: flex;
		align-items: center;
	}
</style>