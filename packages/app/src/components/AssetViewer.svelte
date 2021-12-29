<script lang='ts'>
	import type { Asset } from '../interfaces/Asset'

	export let displayed: boolean = false
	export let contained: boolean = false
	export let bg: boolean =false

	export let asset: Asset|undefined
</script>

<main class:contained class:displayed class:bg>
	{#if !asset}
		<span>
			No asset.
		</span>
	{:else}
		{#if asset.mimetype.startsWith('image')}
			<img alt={asset.uuid} src={asset.redirectedSource||asset.originalSource}/>
		{:else if asset.mimetype.startsWith('video')}
			<video controls src={asset.redirectedSource||asset.originalSource}>
				<track kind="captions" />
			</video>
		{:else if asset.mimetype.startsWith('audio')}
			<audio controls src={asset.redirectedSource||asset.originalSource}>
			</audio>
		{:else}
			<span>
				Unhandled asset type.
			</span>
		{/if}
	{/if}
</main>

<style>
	.contained img, .contained video, .contained audio {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.displayed {
		padding: .25em;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.bg {
		background: var(--bar-bg);
		box-shadow: inset 0 0 1em 0 black;
	}
</style>