<script lang='ts'>
	import type { Asset } from '../interfaces/Asset'
  import Button from './Button.svelte'
  import Icon from './Icon.svelte'

	export let displayed: boolean = false
	export let contained: boolean = false
	export let bg: boolean =false
	export let minimal: boolean = false
	export let volume: number = 1.0

	export let asset: Asset|undefined

	function play() {
		if (!asset) return
		let audio = new Audio()
		audio.volume = volume
		audio.src = asset.redirectedSource||asset.originalSource
		audio.play()
	}
</script>

<main class:contained class:displayed class:bg class:minimal>
	{#if !asset}
		<span>
			No asset.
		</span>
	{:else}
		{#if asset.mimetype.startsWith('image')}
			<img alt={asset.uuid} src={asset.redirectedSource||asset.originalSource}/>
		{:else if asset.mimetype.startsWith('video')}
			<video volume={volume} controls src={asset.redirectedSource||asset.originalSource}>
				<track kind="captions" />
			</video>
		{:else if asset.mimetype.startsWith('audio')}
			{#if minimal}
				<span>
					<Button small on:click={play}>
						<Icon icon={'start'}></Icon>
					</Button>
				</span>
			{:else}
				<audio volume={volume} controls src={asset.redirectedSource||asset.originalSource}>
				</audio>
			{/if}
		{:else}
			<span>
				Unhandled asset type.
			</span>
		{/if}
	{/if}
</main>

<style>
	.minimal {
		display: inline-block;
	}
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