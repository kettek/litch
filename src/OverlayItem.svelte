<script type="ts">
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

	export let overlay: OverlayInterface
	export let uuid: string
	let title: string = overlay.title
	let width: number = overlay.canvas.width
	let height: number = overlay.canvas.height

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

	let showDangerous: boolean

	const dispatch = createEventDispatcher<string>()
</script>

<main transition:fly="{{delay: 0, duration: 200, x: 500, y: 0, easing: quintInOut}}">
	<nav>
		<button on:click={()=>uuid=''}>back</button>
		<header>{overlay.title}</header>
	</nav>
	<details bind:open={overlay.openSettings}>
		<summary class='nav__heading'>Settings</summary>
		<article>
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
				<button disabled={!changed} on:click={handleApply}>apply</button>
				<button on:click={()=>showDangerous=true}>dangerous mode</button>
			{:else}
				<button on:click={()=>showDangerous=false}>back</button>
				<button on:click={()=>dispatch('delete', uuid)}>delete</button>
			{/if}
		</article>
	</details>
	<details bind:open={overlay.openModules}>
		<summary class='nav__heading'>Modules</summary>
		<article style="padding: 0; height:100%;">
			<ModuleList modules={modules} on:add={handleAddModule}/>
			{#each overlay.modules as module}
				<ModuleItem bind:module={module} modules={modules}/>
			{/each}
		</article>
	</details>
</main>

<style>
	main {
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: auto auto minmax(0, 1fr);
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
		font-size: 150%;
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
	section header {
		font-weight: 600;
		display: flex;
		align-items: center;
		padding-left: .5em;
	}
	article {
		overflow-y: auto;
		color: var(--tertiary);
	}
	summary {
		background: var(--tertiary);
		color: var(--text);
	}
</style>