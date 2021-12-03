<script type="ts">
	import { onMount } from 'svelte'

	import type { SettingsInterface } from './Settings'

	//export let settings: SettingsInterface

	let emoji = '❄'
	let items = []
	let count = 30
	let updateRate = 50
	let maxAccumulator = updateRate * 4
	let spawnX = 0
	let spawnY = -110
	let minScale = 0.5
	let scaleRandom = 1
	let size = 2

	let xRandomRate = [-0.25, 0.25]
	let yRandomRate = [0.5, 1]

	let rotRandomRate = [-2, 2]

	function reload() {
	items = new Array(count).fill({}).map((_, i) => {
		return {
			x: spawnX + Math.random() * 100,
			xRate: Math.random() * (xRandomRate[1] - xRandomRate[0]) + xRandomRate[0],
			y: spawnY + Math.random() * 100,
			yRate: Math.random() * (yRandomRate[1] - yRandomRate[0]) + yRandomRate[0],
			scale: minScale + Math.random() * scaleRandom,
			rotation: Math.random() * 360,
			rotRate: Math.random() * (rotRandomRate[1] - rotRandomRate[0]) + rotRandomRate[0],
			dir: Math.random() - 0.5,
		}
	})
	.sort((a, b) => a.scale - b.scale)
	}

	reload()
	console.log(items)

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
		if (accumulator > maxAccumulator) {
		accumulator = maxAccumulator
		}

		while(accumulator >= updateRate) {
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
		accumulator -= updateRate
		}
		items = items
	}
	loop()

	return () => cancelAnimationFrame(frame)
	})
</script>

<section>
	{#each items as item}
	<div style="left: {item.x+Math.cos((item.y+item.x)/4)*2}%; top: {item.y}%; transform: scale({size*item.scale}) rotate({item.rotation+(item.y/100*360*item.dir)}deg);" class='item'>{emoji}️</div>
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