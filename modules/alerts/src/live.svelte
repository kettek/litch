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
				message: message.message,
			}]
			setTimeout(() => {
				alerts = alerts.filter(v=>v.id!==alertID)
			}, Math.max(2000, message.lifetime))
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
		display: inline-block;
		color: var(--focusColor);
	}
	div :global(strong.alerts-rainbow) {
		text-shadow: none;
		background: linear-gradient(to left, #6666ff, #0099ff , #00ff00, #ff3399, #6666ff, #0099ff);
		background-clip: text;
		-webkit-background-clip: text;
		color: transparent;
		animation: alertsRainbowAnimation 2s linear infinite;
		background-size: 400% 100%;
		padding: 0.1em;
	}
	div :global(strong span) {
		display: inline-block;
	}
	div :global(strong.alerts-vibrate) {
		animation: alertsVibrate 0.1s linear infinite;
	}
	div :global(strong.alerts-bounce) {
		animation: alertsBounce 1s linear infinite;
	}
	div :global(strong.alerts-wiggle span:nth-child(4n)) {
		animation: alertsWiggle 0.4s linear infinite;
		animation-delay: -0.1s;
	}
	div :global(strong.alerts-wiggle span:nth-child(4n+1)) {
		animation: alertsWiggle 0.4s linear infinite;
		animation-delay: -0.2s;
	}
	div :global(strong.alerts-wiggle span:nth-child(4n+2)) {
		animation: alertsWiggle 0.4s linear infinite;
		animation-delay: -0.3s;
	}
	div :global(strong.alerts-wiggle span:nth-child(4n+3)) {
		animation: alertsWiggle 0.4s linear infinite;
		animation-delay: -0.4s;
	}


	@keyframes -global-alertsRainbowAnimation {
		0% {
			background-position: 0 0;
		}

		100% {
			background-position: 100% 0;
		}
	}

	@keyframes -global-alertsVibrate {
		0% {
			transform: translate(0, 0);
		}
		12.5% {
			transform: translate(-0.03em, -0.03em);
		}
		25% {
			transform: translate(0, 0);
		}
		37.5% {
			transform: translate(0.03em, 0.03em);
		}
		50% {
			transform: translate(0, 0);
		}
		62.5% {
			transform: translate(-0.03em, 0.03em);
		}
		75% {
			transform: translate(0, 0);
		}
		87.5% {
			transform: translate(0.03em, -0.03em);
		}
		100% {
			transform: translate(0, 0);
		}
	}

	@keyframes -global-alertsWiggle {
		0% {
			transform: translateX(0) rotate(0);
		}
		25% {
			transform: translateX(-0.01em) rotate(-3deg);
		}
		50% {
			transform: translateX(0) rotate(0);
		}
		75% {
			transform: translateX(0.01em) rotate(3deg);
		}
		100% {
			transform: translateX(0) rotate(0);
		}
	}

	@keyframes -global-alertsBounce {
		0% {
			transform: translateY(0.1em) scale(1.1, 0.8);
		}
		25% {
			transform: translateY(-0.15em) scale(0.9, 1.0);
		}
		50% {
			transform: translateY(-0.25em) scale(0.9, 1.0);
		}
		75% {
			transform: translateY(-0.05em) scale(0.9, 1.0);
		}
		100% {
			transform: translateY(0.1em) scale(1.1, 0.8);
		}
	}

</style>