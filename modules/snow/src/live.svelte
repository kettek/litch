<script type="ts">
	import { onMount } from 'svelte'

	import type { ModuleChannel } from '@kettek/litch-app/src/interfaces/ModuleInstance'
	import type { AssetManager } from '@kettek/litch-app/src/interfaces/Asset'
	import type { SettingsInterface } from './SettingsI'

	export let channel: ModuleChannel
	export let assets: AssetManager
	export let settings: SettingsInterface

	let items = []

	function reload() {
		items = []
		for (let group of settings.groups) {
			items = [...items, ...new Array(group.count).fill({}).map((_, i) => {
				return {
					x: group.spawnX + Math.random() * 100,
					xRate: Math.random() * (group.xRandomRate[1] - group.xRandomRate[0]) + group.xRandomRate[0],
					y: group.spawnY + Math.random() * 100,
					yRate: Math.random() * (group.yRandomRate[1] - group.yRandomRate[0]) + group.yRandomRate[0],
					scale: group.minScale + Math.random() * group.scaleRandom,
					rotation: group.rotate ? Math.random() * 360 : 0,
					rotRate: Math.random() * (group.rotRandomRate[1] - group.rotRandomRate[0]) + group.rotRandomRate[0],
					dir: Math.random() - 0.5,
					// I guess this isn't too inefficient. We're being lazy and keeping a reference to its group so we can maintain simple item iteration but allow all items to be sorted in the same array.
					groupSettings: group,
				}
			})]
		}
		items.sort((a, b) => a.scale - b.scale)
	}

	reload()

	onMount(() => {
		let frame: number
		let lastFrame = performance.now()
		let currFrame = performance.now()
		let accumulator = 0

		function loop() {
			frame = requestAnimationFrame(loop)

			currFrame = performance.now()
			let delta = currFrame - lastFrame
			lastFrame = currFrame
			accumulator += delta
			if (accumulator > settings.maxAccumulator) {
				accumulator = settings.maxAccumulator
			}

			while(accumulator >= settings.updateRate) {
				for (let item of items) {
					item.y += item.yRate * item.scale/4
					item.x += item.xRate * item.scale/4
					item.rotation += item.rotRate
					if (item.y > 110) item.y = -10
					if (item.x > 110) item.x = -10
					else if (item.x < -10) item.x = 110
					if (item.rotation > 360) item.rotation = 0
					else if (item.rotation < 0) item.rotation = 360
				}
				accumulator -= settings.updateRate
			}
			items = items
		}
		loop()

		channel.receive = async ({topic, message}) => {
			if (topic === 'reload') {
				reload()
			}
		}

		return () => cancelAnimationFrame(frame)
	})
</script>

<section>
	{#each items as item}
		<div style="left: {item.x+Math.cos((item.y+item.x)/5)*2}%; top: {item.y}%; transform: scale({item.groupSettings.size*item.scale}) rotate({item.rotation}deg);" class='item'>
			{#if item.groupSettings.sourceType === 'emoji'}
				{item.groupSettings.emoji}️
			{:else if item.groupSettings.sourceType === 'asset'}
				{#if item.groupSettings.reference?.mimetype?.startsWith('image')}
					<img alt="" src={assets.source(item.groupSettings.reference)}/>
				{:else if item.groupSettings.reference?.mimetype?.startsWith('video')}
					<video autoplay loop>
						<track kind="captions"/>
						<source src="{assets.source(item.groupSettings.reference)}" type="{item.groupSettings.reference.mimetype}">
					</video>
				{/if}
			{/if}
		</div>
	{/each}
</section>

<style>
	section {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		color: white;
	}
	.item {
		position: absolute;
	}
	.sin {
		--sin-term1: var(--angle);
		--sin-term2: calc((var(--angle) * var(--angle) * var(--angle)) / 6);
		--sin-term3: calc((var(--angle) * var(--angle) * var(--angle) * var(--angle) * var(--angle)) / 120);
		--sin-term4: calc((var(--angle) * var(--angle) * var(--angle) * var(--angle) * var(--angle) * var(--angle) * var(--angle)) / 5040);
		--sin-term5: calc((var(--angle) * var(--angle) * var(--angle) * var(--angle) * var(--angle) * var(--angle) * var(--angle) * var(--angle) * var(--angle)) / 362880);
		--sin: calc(var(--sin-term1) - var(--sin-term2) + var(--sin-term3) - var(--sin-term4) + var(--sin-term5));
	}
	.cos {
		--cos-term1: 1;
		--cos-term2: calc((var(--angle) * var(--angle)) / 2);
		--cos-term3: calc((var(--angle) * var(--angle) * var(--angle) * var(--angle)) / 24);
		--cos-term4: calc((var(--angle) * var(--angle) * var(--angle) * var(--angle) * var(--angle) * var(--angle)) / 720);
		--cos-term5: calc((var(--angle) * var(--angle) * var(--angle) * var(--angle) * var(--angle) * var(--angle) * var(--angle) * var(--angle)) / 40320);
		--cos: calc(var(--cos-term1) - var(--cos-term2) + var(--cos-term3) - var(--cos-term4) + var(--cos-term5));
	}
	.tan {
		--tan-term1: var(--angle);
		--tan-term2: calc((1/3) * var(--angle) * var(--angle) * var(--angle));
		--tan-term3: calc((2 / 15) * var(--angle) * var(--angle) * var(--angle) * var(--angle) * var(--angle));
		--tan-term4: calc((17/315) * var(--angle) * var(--angle) * var(--angle) * var(--angle) * var(--angle) * var(--angle) * var(--angle));
		--tan: calc(var(--tan-term1) + var(--tan-term2) + var(--tan-term3) + var(--tan-term4));
	}
</style>