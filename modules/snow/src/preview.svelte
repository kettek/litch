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
		{#each settings.groups as group}
			{#if group.sourceType === 'asset'}
				<img alt='' src={assets.source(group.reference)}/>
			{:else if group.sourceType === 'emoji'}
				<span>{group.emoji}</span>
			{/if}
		{/each}
	</section>
	<header>Snow</header>
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