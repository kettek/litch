<script lang="ts">
	import type { Asset } from "./interfaces/Asset"
	import { isAssetFiltered } from './assets'

	export let selectedUUID: string
	export let assets: Asset[] | undefined
	export let filter: string
</script>

{#if assets}
	{#each assets.sort((a,b)=>a.name.localeCompare(b.name)) as asset (asset.uuid)}
		{#if !isAssetFiltered(asset, filter)}
			<div on:click={()=>selectedUUID = asset.uuid} title='{asset.uuid}' class='asset'>
				<header>{asset.name}</header>
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
			</div>
		{/if}
	{/each}
{/if}

<style>
	.asset {
		width: 10em;
		height: 10em;
		display: inline-grid;
		grid-template-rows: auto minmax(0, 1fr);
		margin: .5em;
		background: var(--tertiary);
		color: var(--text);
		border-radius: .25em .75em;
	}
	.asset > header {
		padding: .25em 0;
		text-align: center;
		font-weight: 600;
		text-overflow: ellipsis;
		overflow: hidden;
		word-break: break-word;
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