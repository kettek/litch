<script type="ts">
	import type { ModuleChannel } from '@kettek/litch-app/src/interfaces/ModuleInstance'
	import type { AssetManager, AssetResult } from '@kettek/litch-app/src/interfaces/Asset'
	import { onMount } from 'svelte'
	import type { SettingsInterface } from './Settings'
	import { isLitchTuber, isPuppeteerTuber } from './Settings'

	export let assets: AssetManager
	export let channel: ModuleChannel
	export let live: any = {}
	export let settings: SettingsInterface = {}

	let reference: AssetResult = live.reference

	onMount(() => {
		channel.receive = async ({topic, message}) => {
			if (topic === 'setImage') {
				reference = message.reference
			}
		}
	})
</script>

<div>
	{#if isLitchTuber(settings.tuber)}
		TODO
	{:else if isPuppeteerTuber(settings.tuber)}
		{#each settings.tuber.emotions as emotion}
			{#each Object.entries(emotion.faces) as [key, face]}
				{#if face.reference.mimetype?.startsWith('video/')}
					<video class:visible={face.reference.collection===reference.collection&&face.reference.asset===reference.asset} src={assets.source(face.reference)} autoplay muted loop>
						<track kind="captions">
					</video>
				{:else}
					<img class:visible={face.reference.collection===reference.collection&&face.reference.asset===reference.asset} alt='' src='{assets.source(face.reference)}'/>
				{/if}
			{/each}
		{/each}
	{/if}
</div>

<style>
	div {
		position: relative;
		width: 100%;
		height: 100%;
	}
	img, video {
		position: absolute;
		width: 100%;
		height: 100%;
		object-fit: contain;
		visibility: hidden;
	}
	img.visible, video.visible {
		visibility: visible;
	}
</style>