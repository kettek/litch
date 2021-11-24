<script type="ts">
	import { flip } from 'svelte/animate'
	import { fly } from 'svelte/transition'
	import { _ } from 'svelte-i18n'
	import { quintInOut } from 'svelte/easing'
	import type { OverlayInterface } from './interfaces/Overlay'
	import { createEventDispatcher } from 'svelte'
	import ModuleItem from './ModuleItem.svelte'

	import type { ModuleInterface } from './interfaces/Module'
	import ModuleList from './ModuleList.svelte'
	import { v4 } from 'uuid'
	export let modules: Record<string, ModuleInterface> = {}

	import Button from './components/Button.svelte'

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
		// TODO: We need module.defaults.{} that contains box, settings, and title.
		overlay.modules.push({
			title: module.defaults.title,
			uuid: v4(),
			box: {...module.defaults.box},
			moduleUUID: evt.detail,
			settings: {...module.defaults.settings},
			openDimensions: false,
			openSettings: true,
		})
		dispatch('refresh', uuid)
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

	let showDangerous: boolean

	const dispatch = createEventDispatcher<string>()
</script>

<main transition:fly="{{delay: 0, duration: 200, x: 500, y: 0, easing: quintInOut}}">
	<nav>
		<button on:click={()=>uuid=''}>back</button>
		<header>{overlay.title}</header>
	</nav>
	<article class:secondary={true}>
		{#if !showDangerous}
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
				<Button secondary on:click={()=>showDangerous=true}>danger mode</Button>
				<Button secondary disabled={!changed} on:click={handleApply}>apply</Button>
			</footer>
		{:else}
			<footer>
				<Button secondary on:click={()=>showDangerous=false}>back</Button>
				<Button dangerous on:click={()=>dispatch('delete', uuid)}>delete</Button>
			</footer>
		{/if}
	</article>
	<details bind:open={overlay.openAvailableModules}>
		<summary class='nav__heading'>Available Modules</summary>
		<ModuleList modules={modules} on:add={handleAddModule}/>
	</details>
	<details style="padding: 0 1em 1em 1em" bind:open={overlay.openActiveModules}>
		<summary class='nav__heading'>Active Modules</summary>
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
				</li>
			{/each}
		</ul>
	</details>
	{#if focusedModule}
		<ModuleItem bind:module={focusedModule} modules={modules} bind:focusedUUID={focusedModuleUUID}/>
	{/if}
</main>

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
	section {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: auto minmax(0, 1fr);
	}
	details {
		padding: 1em;
	}
	section header {
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
	article.secondary footer button {
		background-color: var(--secondary);
		color: var(--text);
		border: 0; border-radius: 0;
		height: 100%;
	}
	summary {
		background: var(--tertiary);
		color: var(--text);
	}
	ul {
		background: var(--bar-bg);
		margin: 0 .75em 1em .75em;
		padding: 1em;
		border-radius: 0 0 1em 1em;
	}
	li {
		list-style: none;
		min-height: 2em;
		display: grid;
		grid-template-rows: minmax(0, 1fr);
		grid-template-columns: minmax(0, 1fr);
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