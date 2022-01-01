<script type="ts">
	import type { AssetManager } from '@kettek/litch-app/src/interfaces/Asset'
	import type { ModuleChannel } from '@kettek/litch-app/src/interfaces/ModuleInstance'
	import type { SettingsInterface } from './SettingsI'

	export let settings: SettingsInterface
</script>

<div>
	<section>
		{#each settings.groups as group}
			TODO
		{/each}
	</section>
	<header>Fireworks</header>
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
	header {
		text-align: center;
		background: var(--tertiary);
		color: var(--text);
	}
</style>