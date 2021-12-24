<script lang="ts">
	import type { Asset } from "./interfaces/Asset"
	import { isAssetFiltered } from './assets'

	import { _ } from "svelte-i18n"
	import Card from "./components/Card.svelte"

	export let selector: boolean = false
	export let multiple: boolean = false
	export let focused: string = ''
	export let selected: string[] = []
	export let assets: Asset[] | undefined = []
	export let filter: string = ''

	$: filteredAssets = assets?.sort((a,b)=>a.name.localeCompare(b.name)).filter(asset=>!isAssetFiltered(asset, filter))

	let showPopup = false
	$: focusedAsset = assets?.find(v=>v.uuid===focused)
	$: selectedAssets = selected.map(v=>assets?.find(v2=>v2.uuid===v))

	function onAssetDoubleClick(e: MouseEvent, uuid:string) {
		showPopup = true
	}

	function onAssetClick(e: MouseEvent, uuid: string) {
		if (!filteredAssets) return

		if (multiple) {
			if (e.shiftKey) {
				let focusedIndex = filteredAssets.findIndex(v=>v.uuid===focused)
				let targetIndex = filteredAssets.findIndex(v=>v.uuid===uuid)
				// FIXME: lazy code duplication
				if (targetIndex < focusedIndex) {
					for (let i = focusedIndex; i >= targetIndex; i--) {
						let uuid = filteredAssets[i].uuid
						if (e.ctrlKey) {
							if (selected.includes(uuid)) {
								selected = selected.filter(v=>v!==uuid)
							} else {
								selected = [ ...selected, uuid ]
							}
						} else {
							if (!selected.includes(uuid)) {
								selected = [ ...selected, uuid ]
							}
						}
					}
				} else if (targetIndex > focusedIndex) {
					for (let i = focusedIndex; i <= targetIndex; i++) {
						let uuid = filteredAssets[i].uuid
						if (e.ctrlKey) {
							if (selected.includes(uuid)) {
								selected = selected.filter(v=>v!==uuid)
							} else {
								selected = [ ...selected, uuid ]
							}
						} else {
							if (!selected.includes(uuid)) {
								selected = [ ...selected, uuid ]
							}
						}
					}
				}
			} else if (e.ctrlKey) {
				if (selected.includes(uuid)) {
					selected = selected.filter(v=>v!==uuid)
				} else {
					selected = [ ...selected, uuid ]
				}
			} else {
				selected = [ uuid ]
			}
		} else {
			selected = [ uuid ]
		}

		focused = uuid
	}
</script>

<section class:selector>
	{#if assets}
		{#if filteredAssets}
			{#each filteredAssets as asset (asset.uuid)}
				<div on:click={(e)=>onAssetClick(e, asset.uuid)} on:dblclick={(e)=>onAssetDoubleClick(e, asset.uuid)} title='{asset.uuid}' class='asset' class:focused={focused===asset.uuid} class:selector={selector} class:selected={selected.includes(asset.uuid)}>
					{#if !selector}
						<header>{asset.name}</header>
					{/if}
					<article>
						{#if asset.mimetype.startsWith('image')}
							<img alt={asset.uuid} src={asset.redirectedSource||asset.originalSource}/>
						{:else if asset.mimetype.startsWith('video')}
							<video controls src={asset.redirectedSource||asset.originalSource}>
								<track kind="captions" />
							</video>
						{:else if asset.mimetype.startsWith('audio')}
							<audio controls src={asset.redirectedSource||asset.originalSource}>
							</audio>
						{/if}
					</article>
					{#if selector}
						<header>{asset.name}</header>
					{/if}
				</div>
			{/each}
		{/if}
	{/if}
	{#if showPopup}
		<Card zIndex={1} tertiary on:close={()=>showPopup=false}>
			<svelte:fragment slot='title'>
				{$_('assets.viewTitle')}
			</svelte:fragment>
			<section class='popup' slot='content'>
				{#if focusedAsset}
					{#if focusedAsset.mimetype.startsWith('image')}
						<img alt={focusedAsset.uuid} src={focusedAsset.redirectedSource||focusedAsset.originalSource}/>
					{:else if focusedAsset.mimetype.startsWith('video')}
						<video controls src={focusedAsset.redirectedSource||focusedAsset.originalSource}>
							<track kind="captions" />
						</video>
					{:else if focusedAsset.mimetype.startsWith('audio')}
						<audio controls src={focusedAsset.redirectedSource||focusedAsset.originalSource}>
						</audio>
					{/if}
				{/if}
			</section>
		</Card>
	{/if}
</section>

<style>
	section {
		height: 100%;
		overflow: auto;
		user-select: none;
	}
	section.selector {
		padding: 0 .5em;
	}
	.asset {
		width: 10em;
		height: 10em;
		display: inline-grid;
		grid-template-rows: auto minmax(0, 1fr);
		margin: .5em;
		background: var(--tertiary);
		color: var(--text);
		border-radius: .25em .75em;
		border: 2px solid var(--tertiary);
		outline: 2px solid var(--tertiary);
	}
	.asset.selector {
		width: 100%;
		height: 3em;
		display: grid;
		margin: .5em 0;
		grid-template-rows: minmax(0, 1fr);
		grid-template-columns: 3em minmax(0, 1fr);
	}
	.asset.selected {
		background: var(--tertiary-focus);
	}
	.asset.selected.focused {
		border: 2px solid var(--text);
	}
	.asset > header {
		padding: .25em 0;
		text-align: center;
		font-weight: 600;
		text-overflow: ellipsis;
		overflow: hidden;
		word-break: break-word;
		display: grid;
		align-items: center;
		justify-content: center;
	}
	.asset > article {
		padding: .25em;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.asset > article img, .asset > article video, .asset > article audio {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
</style>