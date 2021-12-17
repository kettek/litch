<script type="ts">
	import { fly } from 'svelte/transition'
	import { quintInOut } from 'svelte/easing'
	import type { ModuleInstanceInterface } from "./interfaces/ModuleInstance"
	import type { ModuleInterface } from './interfaces/Module'
	import type { AssetManager, AssetResult, AssetResults } from './interfaces/Asset'
	import ModuleWrapper from "./ModuleWrapper.svelte"
	import Icon from './components/Icon.svelte'
	import Button from './components/Button.svelte'

	import AssetsCard from './AssetsCard.svelte'
	import { getAssetSource } from './assets'
	import { refreshOverlays } from './stores/overlays'

	export let modules: Record<string, ModuleInterface> = {}
	export let module: ModuleInstanceInterface
	export let focusedUUID: string

	$: pendingSettings = JSON.parse(JSON.stringify(module.settings)) // FIXME: Use a clone lib

	let update: (value: any) => void = (value: any) => {
		module.settings = value
		refreshOverlays()
		module.channel.publish('update', module.settings)
	}

	let updateBox: (value: any) => void = (value: any) => {
		module.box = value
	}

	let showAssets = false
	let showOptions: any = {}
	let assetResolve: undefined | ((value: AssetResults) => void)
	let assetReject: undefined | ((reason?: any) => void)

	function closeAssets(e: any) {
		showAssets = false
		if (assetResolve) {
			assetResolve(e.detail)
		}
		assetResolve = undefined
		assetReject = undefined
	}
	let assets: AssetManager = {
		open: (options: any): Promise<AssetResults> => {
			return new Promise((resolve, reject) => {
				assetResolve = resolve
				assetReject = reject
				showOptions = options
				showAssets = true
			})
		},
		source: (ref: AssetResult): string => {
			return getAssetSource(ref)
		}
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
			<div>
				<label>
					<input type="number" bind:value={module.box.rotate}>
					<span>rotation</span>
				</label>
			</div>
		</div>
		<div class='dimensions__icon' title='Left, Top, Width, and Height'>
			<Icon cursor='default' icon='dimensions'></Icon>
		</div>
	</article>
	<hr/>
	<article class='module__wrapper'>
		<ModuleWrapper this={realModule.settingsComponent} bind:settings={pendingSettings} bind:live={module.live} bind:box={module.box} bind:updateBox={updateBox} channel={module.channel} assets={assets} />
	</article>
	<nav class='module__controls'>
		<Button tertiary on:click={()=>{module.channel.publish('reload', module.settings)}}>
			<Icon icon='reload'></Icon>
		</Button>
		<Button tertiary on:click={()=>update(pendingSettings)}>
			<Icon icon='checkmark'></Icon>
		</Button>
	</nav>
</main>
{#if showAssets}
	<AssetsCard multiple={showOptions.multiple} on:close={closeAssets}/>
{/if}

<style>
	main {
		position: absolute;
		top: 0; left: 0;
		width: 100%; height: 100%;
		display: grid;
		grid-template-rows: auto auto auto auto minmax(0, 1fr) auto;
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
	article.module__wrapper {
		overflow: auto;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: minmax(0, 1fr);
	}
	nav.module__controls {
		display: grid;
		grid-template-columns: auto auto;
		align-items: stretch;
		justify-content: stretch;
		background: initial;
		color: var(--tertiary);
	}

</style>