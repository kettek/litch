<script type="ts">
	import { fly } from 'svelte/transition'
	import { quintInOut } from 'svelte/easing'
	import type { ModuleInstanceInterface } from "./interfaces/ModuleInstance";
	import type { ModuleInterface } from './interfaces/Module'
	import ModuleWrapper from "./ModuleWrapper.svelte"

	export let modules: Record<string, ModuleInterface> = {}
	export let module: ModuleInstanceInterface
	export let focusedUUID: string

	let update: (value: any) => void = (value: any) => {
		module.settings = value
	}

	let updateBox: (value: any) => void = (value: any) => {
		module.box = value
	}

	$: realModule = modules[module.moduleUUID]
</script>

<main transition:fly="{{delay: 0, duration: 200, x: 500, y: 0, easing: quintInOut}}">
	<nav>
		<button on:click={()=>focusedUUID=''}>back</button>
		<header>{module.title}({realModule.title})</header>
	</nav>
	<article>
		<label>
			<input type="number" bind:value={module.box.x}>
			X
		</label>
		<label>
			<input type="number" bind:value={module.box.y}>
			Y
		</label>
		<label>
			<input type="number" bind:value={module.box.width}>
			Width
		</label>
		<label>
			<input type="number" bind:value={module.box.height}>
			Height
		</label>
	</article>
	<article>
		<ModuleWrapper this={realModule.settingsComponent} settings={module.settings} bind:box={module.box} bind:update={update} bind:updateBox={updateBox} />
	</article>
</main>

<style>
	main {
		position: absolute;
		top: 0; left: 0;
		width: 100%; height: 100%;
		display: grid;
		grid-template-rows: auto auto minmax(0, 1fr);
		background: var(--nav-bg);
	}
	nav {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: stretch;
		justify-content: stretch;
		background: var(--tertiary);
		color: var(--text);
	}
	nav header {
		font-size: 150%;
		font-weight: 600;
		display: flex;
		align-items: center;
		padding-left: .5em;
	}
	article {
		color: var(--tertiary);
		padding: .5em;
	}
</style>