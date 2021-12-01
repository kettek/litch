<script type="ts">
	import type { BoxInterface } from '../../../src/interfaces/Box'
	import type { SettingsInterface } from './Settings'

	export let settings: SettingsInterface
</script>

<div style="image-rendering: {settings.imageRendering}; --object-fit: {settings.objectFit}; --object-position: {settings.objectPosition}; {settings.style}">
	{#if settings.mimetype.startsWith('audio')}
		<audio autoplay loop src="{settings.localSource||settings.source}">
		</audio>
	{:else if settings.mimetype.startsWith('video')}
		<video autoplay loop>
			<source src="{settings.localSource||settings.source}" type="{settings.mimetype}">
		</video>
	{:else if settings.mimetype.startsWith('image')}
		<img alt="{settings.localSource||settings.source}" src="{settings.localSource||settings.source}">
	{:else}
		unsupported type
	{/if}
</div>

<style>
	div {
		width: 100%;
		height: 100%;
	}
	audio, video, img {
		object-position: var(--object-position);
		object-fit: var(--object-fit);
		width: 100%;
		height: 100%;
	}
</style>