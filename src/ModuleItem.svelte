<script type="ts">
	import { fly } from 'svelte/transition'
	import { quintInOut } from 'svelte/easing'
	import type { ModuleInstanceInterface } from "./interfaces/ModuleInstance";
	import type { ModuleInterface } from './interfaces/Module'
	import ModuleWrapper from "./ModuleWrapper.svelte"
	import Icon from './components/Icon.svelte'
	import Button from './components/Button.svelte'

	import { publisher } from './modules'

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
		<Button nobg on:click={()=>focusedUUID=''}>
			<Icon icon='back'></Icon>
		</Button>
		<header>{realModule.title}</header>
	</nav>
	<article class='title'>
		<label>
			<input type="text" bind:value={module.title}>
			<span>Title</span>
		</label>
	</article>
	<article class='dimensions'>
		<div class='dimensions__fields'>
			<div>
				<label>
					<input type="number" bind:value={module.box.x}>
				</label>
				<span>x</span>
				<label>
					<input type="number" bind:value={module.box.y}>
				</label>
			</div>
			<div>
				<label>
					<input type="number" bind:value={module.box.width}>
				</label>
				<span>x</span>
				<label>
					<input type="number" bind:value={module.box.height}>
				</label>
			</div>
		</div>
		<div class='dimensions__icon' title='Left, Top, Width, and Height'>
			<Icon cursor='default' icon='dimensions'></Icon>
		</div>
	</article>
	<hr/>
	<article>
		<ModuleWrapper this={realModule.settingsComponent} settings={module.settings} bind:box={module.box} bind:update={update} bind:updateBox={updateBox} publisher={publisher} />
	</article>
</main>

<style>
	main {
		position: absolute;
		top: 0; left: 0;
		width: 100%; height: 100%;
		display: grid;
		grid-template-rows: auto auto auto auto minmax(0, 1fr);
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
		font-weight: 600;
		display: flex;
		align-items: center;
		padding-left: .5em;
	}
	article {
		color: var(--tertiary);
		padding: .5em;
	}
	article.dimensions {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		grid-template-rows: minmax(0, 1fr);
	}
	div.dimensions__fields {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
	}
	div.dimensions__fields div {
		display: grid;
		align-items: center;
		grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
		grid-template-rows: minmax(0, 1fr);
	}
	div.dimensions__fields input {
		width: 100%;
	}
	div.dimensions__fields span {
		margin: 0 .25em;
	}
	div.dimensions__icon {
		display: grid;
		font-size: 150%;
		margin-left: 0.25em;
	}
	hr {
		border-color: var(--tertiary);
		border-style: solid;
		width: calc(100% - 4em);
	}
	article.title label {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
	}
	article.title label span {
		margin-left: 0.25em;
	}
</style>