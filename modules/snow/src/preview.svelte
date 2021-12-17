<script type="ts">
	import type { AssetManager } from '@kettek/litch-app/src/interfaces/Asset'
	import type { SettingsInterface } from './SettingsI'

	export let settings: SettingsInterface
	export let assets: AssetManager
</script>

<div>
	<img alt='' src={assets.source(settings.reference)}/>
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