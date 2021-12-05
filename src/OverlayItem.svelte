<script type="ts">
	import { flip } from 'svelte/animate'
	import { fly } from 'svelte/transition'
	import { _ } from 'svelte-i18n'
	import { quintInOut } from 'svelte/easing'
	import type { OverlayInterface } from './interfaces/Overlay'
	import { createEventDispatcher, tick } from 'svelte'
	import ModuleItem from './ModuleItem.svelte'

	import type { ModuleInterface } from './interfaces/Module'
	import ModuleList from './ModuleList.svelte'
	import { v4 } from 'uuid'
	export let modules: Record<string, ModuleInterface> = {}

	import Button from './components/Button.svelte'
	import Icon from './components/Icon.svelte'

	import { createModuleChannel, publisher } from './modules'

	export let overlay: OverlayInterface
	export let uuid: string
	let title: string = overlay.title
	let width: number = overlay.canvas.width
	let height: number = overlay.canvas.height
	let focusedModuleUUID: string
	$: focusedModule = overlay.modules.find(v=>v.uuid===focusedModuleUUID)

	function hasChanges(width: number, height: number, title: string): boolean {
		return width !== overlay.canvas.width || height !== overlay.canvas.height || title !== overlay.title
	}
	$: changed = hasChanges(width, height, title)

	function handleApply() {
		overlay.canvas.width = width
		overlay.canvas.height = height
		overlay.title = title
		width = width
		dispatch('refresh', uuid)
	}

	function handleAddModule(evt: CustomEvent<string>) {
		let module = modules[evt.detail]
		if (!module) return // TODO: show error
		let uuid = v4()
		overlay.modules.push({
			title: module.defaults.title,
			uuid: uuid,
			box: {...module.defaults.box},
			moduleUUID: evt.detail,
			settings: {...module.defaults.settings},
			channel: createModuleChannel(overlay.uuid, uuid),
			openDimensions: false,
			openSettings: true,
		})
		publisher.publish(`overlay.${overlay.uuid}.module.${uuid}.create`, {})
		dispatch('refresh', uuid)
	}
	async function deleteModule(uuid: string) {
		let module = overlay.modules.find(v=>v.uuid===uuid)
		if (!module) return
		overlay.modules = overlay.modules.filter(v=>v.uuid!==uuid)
		await tick()
		publisher.publish(`overlay.${overlay.uuid}.module.${uuid}.delete`, {})
	}

	let hoveringModuleUUID: string
	let fromModuleUUID: string
	function handleModuleDragStart(e: DragEvent, uuid: string) {
		if (!e.dataTransfer) return
		e.dataTransfer.effectAllowed = 'move'
		e.dataTransfer.dropEffect = 'move'
		fromModuleUUID = uuid
	}
	function handleModuleDrop(e: DragEvent, targetUUID: string) {
		if (!e.dataTransfer) return
		e.dataTransfer.dropEffect = 'move'

		const fromIndex = overlay.modules.findIndex(v=>v.uuid===fromModuleUUID)
		const toIndex = overlay.modules.findIndex(v=>v.uuid===targetUUID)

		const modules = overlay.modules
		if (fromIndex < toIndex) {
			overlay.modules.splice(toIndex+1, 0, modules[fromIndex])
			overlay.modules.splice(fromIndex, 1)
		} else {
			overlay.modules.splice(toIndex, 0, modules[fromIndex])
			overlay.modules.splice(fromIndex+1, 1)
		}
		overlay = {
			...overlay,
			modules,
		}
		fromModuleUUID = ''
		hoveringModuleUUID = ''
	}

	const dispatch = createEventDispatcher<string>()

	import Menu from './components/Menu.svelte'
	import MenuOption from './components/MenuOption.svelte'
	import MenuDivider from './components/MenuDivider.svelte'
	import DropList from './components/DropList.svelte'
	let menuPos = {x: 0, y: 0}
	let menuUUID: string
	let showMenu = false
	async function showModuleMenu(e: MouseEvent, uuid: string) {
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
	function closeModuleMenu() {
		showMenu = false
	}
</script>

<main transition:fly="{{delay: 0, duration: 200, x: 500, y: 0, easing: quintInOut}}">
	<nav>
		<Button nobg on:click={()=>uuid=''}>
			<Icon icon='back'></Icon>
		</Button>
		<header>{overlay.title}</header>
	</nav>
	<article class:secondary={true}>
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
		<footer>
			<Button secondary disabled={!changed} on:click={handleApply}>
				<Icon icon='checkmark'></Icon>
			</Button>
		</footer>
	</article>
	<DropList bind:open={overlay.openAvailableModules} tertiary>
		<svelte:fragment slot="heading">
			Available Modules
		</svelte:fragment>
		<svelte:fragment slot="content">
			<ModuleList modules={modules} on:add={handleAddModule}/>
		</svelte:fragment>
	</DropList>
	<DropList style="padding: 0 1em 1em 1em" bind:open={overlay.openActiveModules} tertiary>
		<svelte:fragment slot="heading">
			Active Modules
		</svelte:fragment>
		<svelte:fragment slot="content">
			<ul>
				{#each [...overlay.modules].reverse() as module (module.uuid)}
					<li
						animate:flip="{{duration: 200}}"
						draggable={true}
						on:dragstart={e => handleModuleDragStart(e, module.uuid)}
						on:drop|preventDefault={e => handleModuleDrop(e, module.uuid)}
						ondragover="return false"
						on:dragenter={() => hoveringModuleUUID = module.uuid}
						class:active={hoveringModuleUUID === module.uuid}
					>
						<button on:click={()=>focusedModuleUUID=module.uuid}>{module.title}</button>
						<Button tertiary invert on:click={(e)=>showModuleMenu(e, module.uuid)}><Icon icon='burger'></Icon></Button>
					</li>
				{/each}
			</ul>
		</svelte:fragment>
	</DropList>
	{#if focusedModule}
		<ModuleItem bind:module={focusedModule} modules={modules} bind:focusedUUID={focusedModuleUUID}/>
	{/if}
</main>
{#if showMenu}
	<Menu tertiary {...menuPos} on:click={closeModuleMenu} on:clickoutside={closeModuleMenu}>
		<MenuOption dangerous on:click={()=>deleteModule(menuUUID)}>
			<span>Delete</span>
			<Icon icon='delete'></Icon>
		</MenuOption>
	</Menu>
{/if}

<style>
	main {
		position: absolute;
		top: 0; left: 0;
		width: 100%; height: 100%;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: auto auto auto minmax(0, 1fr);
		overflow: hidden;
	}
	nav {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: stretch;
		justify-content: stretch;
		background: var(--secondary);
		color: var(--text);
	}
	nav header {
		font-weight: 600;
		display: flex;
		align-items: center;
		padding-left: .5em;
	}
	article {
		overflow-y: auto;
		color: var(--tertiary);
		padding: 1.75em;
	}
	article.secondary {
		color: var(--secondary);
	}
	article.secondary footer {
		float: right;
	}
	ul {
		margin: 0;
		padding: 0;
	}
	li {
		list-style: none;
		min-height: 2em;
		display: grid;
		grid-template-rows: minmax(0, 1fr);
		grid-template-columns: minmax(0, 1fr) auto;
		justify-content: stretch;
		align-items: stretch;
		border: 1px solid transparent;
		color: var(--tertiary);
	}
	li.active {
		border: 1px solid var(--tertiary);
	}
	li button {
		cursor: pointer;
		background: none;
		border: 0;
		height: 100%;
		color: var(--tertiary);
		text-align: left;
	}
</style>