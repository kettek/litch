<script type="ts">
	import type { AssetManager } from '@kettek/litch-app/src/interfaces/Asset'
	import type { ModuleChannel } from '@kettek/litch-app/src/interfaces/ModuleInstance'
	import type { SettingsInterface } from './SettingsI'
	import { upgrade } from './upgrade'

	export let settings: SettingsInterface
	export let assets: AssetManager
	export let update: (v: any) => void

	let [changed, settings_] = upgrade(settings)
	if (changed) {
		update(settings_)
	}
</script>

<div>
	<section>
		{#each settings.items as item}
			{#if item.sourceType === 'asset'}
				<img alt='' src={assets.source(item.reference)}/>
			{:else if item.sourceType === 'emoji'}
				<span>{item.emoji}</span>
			{/if}
		{/each}
	</section>
	<header>Tosser</header>
</div>

<style>
	div {
		display: grid;
		grid-template-rows: minmax(0, 1fr) auto;
		width: 100%;
		height: 100%;
		align-items: center;
		justify-content: center;
	}
	section {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	section > * {
		width: 4em;
		height: 4em;
	}
	img {
		max-width: 100%;
		max-height: 100%;
		opacity: 0.25;
		object-fit: contain;
	}
	header {
		text-align: center;
		background: var(--tertiary);
		color: var(--text);
	}
</style>