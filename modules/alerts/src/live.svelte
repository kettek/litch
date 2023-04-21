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
			}, 100*message.length)
		}
	}
</script>

<div style="{settings.style.css}; color: {settings.style.textColor}; -webkit-text-stroke: .01em {settings.style.outlineColor}; font-size: {settings.style.size};">
	{#each alerts as alert (alert.id)}
		<span animate:flip transition:fade>{alert.message}</span>
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
	}
</style>