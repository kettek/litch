<script type="ts">
	import { _ } from 'svelte-i18n'
	import type { ModuleInstanceInterface } from "./interfaces/ModuleInstance"
	import type { Format, FormatMessageObject } from "./interfaces/Format"
	import type { ModuleInterface } from './interfaces/Module'
	import type { AssetManager, AssetResults } from './interfaces/Asset'
	import ModuleWrapper from "./ModuleWrapper.svelte"
	import Icon from './components/Icon.svelte'
	import Button from './components/Button.svelte'

	import Card from './components/Card.svelte'
	import AssetsCard from './AssetsCard.svelte'
	import { createAssetManager } from './assets'
	import { refreshOverlays } from './stores/overlays'

	export let modules: Record<string, ModuleInterface> = {}
	export let module: ModuleInstanceInterface
	export let focusedUUID: string

	$: pendingSettings = JSON.parse(JSON.stringify(module.settings)) // FIXME: Use a clone lib

	let update: (value: any) => Promise<void> = async (value: any) => {
		module.settings = value
		refreshOverlays()
		try {
			await module.channel.publish('update', module.settings)
		} catch(e: any) {
			if (e.errors) {
				for (let err of e.errors) {
					console.error(err)
				}
			} else {
				console.error(e)
			}
		}
	}

	let updateBox: (value: any) => void = (value: any) => {
		module.box = value
	}

	let localeFormat: Format = (messageId: string, options?: FormatMessageObject): string => {
		return $_(`modules.${module.moduleUUID}.${messageId}`, options)
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

	// Create our assets and override the open property.
	let assets: AssetManager = createAssetManager()
	assets.open = (options: any): Promise<AssetResults> => new Promise((resolve, reject) => {
		assetResolve = resolve
		assetReject = reject
		showOptions = options
		showAssets = true
	})

	$: realModule = modules[module.moduleUUID]
</script>

<Card tertiary on:close={()=>focusedUUID=''} doClose>
	<svelte:fragment slot='title'>
		{realModule.title}
	</svelte:fragment>
	<section slot='content'>
		<article class='title'>
			<label>
				<input type="text" bind:value={module.title}>
				<span>{$_('module.title')}</span>
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
						<span>{$_('module.rotation')}</span>
					</label>
				</div>
			</div>
			<div class='dimensions__icon' title='Left, Top, Width, and Height'>
				<Icon cursor='default' icon='dimensions'></Icon>
			</div>
		</article>
		<hr/>
		<article class='module__wrapper'>
			<ModuleWrapper this={realModule.settingsComponent} bind:settings={pendingSettings} bind:live={module.live} bind:box={module.box} bind:updateBox={updateBox} channel={module.channel} assets={assets} format={localeFormat} />
		</article>
	</section>
	<svelte:fragment slot="footer">
		<Button tertiary on:click={()=>{module.channel.publish('reload', module.settings)}} title={$_('module.actions.reload')}>
			<Icon icon='reload'></Icon>
		</Button>
		<Button tertiary on:click={()=>update(pendingSettings)} title={$_('module.actions.applyChanges')}>
			<Icon icon='checkmark'></Icon>
		</Button>
	</svelte:fragment>
</Card>
{#if showAssets}
	<AssetsCard multiple={showOptions.multiple} on:close={closeAssets}/>
{/if}

<style>
	section {
		height: 100%;
		display: grid;
		grid-template-rows: auto auto auto minmax(0, 1fr);
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
</style>