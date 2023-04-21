<script type="ts">
	import type { ModuleChannel } from '@kettek/litch-app/src/interfaces/ModuleInstance'
	import type { AssetManager } from '@kettek/litch-app/src/interfaces/Asset'
	import type { SettingsInterface } from './Settings'
	import { fade } from 'svelte/transition'
	import { flip } from 'svelte/animate'

	export let channel: ModuleChannel
	export let assets: AssetManager
	export let settings: SettingsInterface

	let id: number = 0
	interface AlertI {
		id: number
		message: string
	}

	let alerts: AlertI[] = []

	channel.receive = async ({topic, message}) => {
		if (topic === 'alert') {
			let alertID = id++
			alerts = [...alerts, {
				id: alertID,
				message: message,
			}]
			setTimeout(() => {
				alerts = alerts.filter(v=>v.id!==alertID)
			}, Math.min(2000, 50*message.length))
		}
	}
</script>

<div style="{settings.style.css}; color: {settings.style.textColor}; --outlineColor: {settings.style.outlineColor}; font-size: {settings.style.size}; --focusColor: {settings.style.focusColor}">
	{#each alerts as alert (alert.id)}
		<span animate:flip transition:fade>{@html alert.message}</span>
	{/each}
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