<script type="ts">
	import type { ModuleChannel } from "@kettek/litch-app/src/interfaces/ModuleInstance"
	import type { AssetManager } from '@kettek/litch-app/src/interfaces/Asset'
	import type { SettingsInterface } from './Settings'
	import { upgrade } from './upgrade'

	export let settings: SettingsInterface
	export let assets: AssetManager
	export let update: (value: any) => void
	export let channel: ModuleChannel

	// Ensure settings are upgraded.
	let [changed, settings_] = upgrade(settings)
	if (changed) {
		settings = settings_
		update(settings_)
	}
	console.log('wtf', changed, settings_, settings)

	let example: string
	$: example = settings.example.replaceAll('{', '<strong>').replaceAll('}', '</strong>')

	channel.receive = async (msg) => {
		//
	}
</script>

<div style="{settings.style.css}; color: {settings.style.textColor}; --outlineColor: {settings.style.outlineColor}; font-size: {settings.style.size}; --focusColor: {settings.style.focusColor}">
	<span>{@html example}</span>
</div>

<style>
	div {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		display: grid;
		align-items: center;
		justify-content: center;
		text-shadow: 0 0 2px var(--outlineColor), 0 0 2px var(--outlineColor), 0 0 2px var(--outlineColor), 0 0 2px var(--outlineColor), 0 0 2px var(--outlineColor), 0 0 2px var(--outlineColor), 0 0 2px var(--outlineColor), 0 0 2px var(--outlineColor), 0 0 2px var(--outlineColor), 0 0 2px var(--outlineColor);
	}
	div :global(strong) {
		color: var(--focusColor);
	}
</style>