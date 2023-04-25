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
		for (let groupIndex = 0; groupIndex < settings.groups.length; groupIndex++) {
			let group = settings.groups[groupIndex]
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
					groupIndex: groupIndex,
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
					if (item.y > settings.teleport.Y[1]) item.y = settings.teleport.Y[0]
					else if (item.y < settings.teleport.Y[0]) item.y = settings.teleport.Y[1]
					if (item.x > settings.teleport.X[1]) item.x = settings.teleport.X[0]
					else if (item.x < settings.teleport.X[0]) item.x = settings.teleport.X[1]
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
		{#if settings.groups[item.groupIndex]}
			<div style="left: {item.x+Math.cos((item.y+item.x)/5)*2}%; top: {item.y}%; transform: scale({settings.groups[item.groupIndex].size*item.scale}) rotate({item.rotation}deg);" class='item'>
				{#if settings.groups[item.groupIndex].sourceType === 'emoji'}
					{settings.groups[item.groupIndex].emoji}️
				{:else if settings.groups[item.groupIndex].sourceType === 'asset'}
					{#if settings.groups[item.groupIndex].reference?.mimetype?.startsWith('image')}
						<img alt="" src={assets.source(settings.groups[item.groupIndex].reference)}/>
					{:else if settings.groups[item.groupIndex].reference?.mimetype?.startsWith('video')}
						<video autoplay loop>
							<track kind="captions"/>
							<source src="{assets.source(settings.groups[item.groupIndex].reference)}" type="{settings.groups[item.groupIndex].reference.mimetype}">
						</video>
					{/if}
				{/if}
			</div>
		{/if}
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