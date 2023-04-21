<script type="ts">
	import type { ModuleChannel } from "@kettek/litch-app/src/interfaces/ModuleInstance"
	import type { AssetManager } from '@kettek/litch-app/src/interfaces/Asset'
	import type { SettingsInterface } from './Settings'

	export let settings: SettingsInterface
	export let assets: AssetManager

	export let update: (value: any) => void

	export let channel: ModuleChannel

	channel.receive = async (msg) => {
		//
	}
</script>

<div style="{settings.style.css}; color: {settings.style.textColor}; -webkit-text-stroke: .01em {settings.style.outlineColor}; font-size: {settings.style.size};">
	<span>{settings.example}</span>
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
	}
</style>