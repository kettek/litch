<script type="ts">
	import { onMount } from 'svelte'

	import type { ModuleChannel } from '@kettek/litch-app/src/interfaces/ModuleInstance'
	import type { AssetManager } from '@kettek/litch-app/src/interfaces/Asset'
	import type { SettingsInterface } from './SettingsI'

	export let channel: ModuleChannel
	export let assets: AssetManager
	export let settings: SettingsInterface
	
	interface Item {
		itemIndex: number
		x: number
		y: number
		scale: number
		velocityX: number
		velocityY: number
		lifetime: number
	}

	let items = []


	function reload() {
	}

	reload()
	
	function makeItem(): Item {
		let itemIndex = Math.floor(Math.random()*settings.items.length)

		let velocity = settings.spawnVelocity[0] + Math.random() * (settings.spawnVelocity[1] - settings.spawnVelocity[0])
		let rads = (settings.spawnAngle[0] + Math.random() * (settings.spawnAngle[1] - settings.spawnAngle[0])) * Math.PI / 180
		
		let velocityX = Math.cos(rads) * velocity
		let velocityY = Math.sin(rads) * velocity
		
		let scale = settings.items[itemIndex].scale[0] + Math.random() * (settings.items[itemIndex].scale[1] - settings.items[itemIndex].scale[0])

		return {
			itemIndex: itemIndex,
			x: settings.spawnRangeX[0] + Math.random() * (settings.spawnRangeX[1] - settings.spawnRangeX[0]),
			y: settings.spawnRangeY[0] + Math.random() * (settings.spawnRangeY[1] - settings.spawnRangeY[0]),
			velocityX: velocityX,
			velocityY: velocityY,
			scale: scale,
			lifetime: settings.lifetime[0] + Math.random() * (settings.lifetime[1] - settings.lifetime[0]),
		}
	}
	
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
				items = items.filter(item => {
					item.lifetime--
					if (item.lifetime <= 0) return false
					
					item.velocityX += settings.gravity[0]
					item.velocityY += settings.gravity[1]
					
					if (item.velocityX > 50) {
						item.velocityX = 50
					} else if (item.velocityX < -50) {
						item.velocityX = -50
					}
					
					if (item.velocityY > 50) {
						item.velocityY = 50
					} else if (item.velocityY < -50) {
						item.velocityY = -50
					}
					
					item.x += item.velocityX
					item.y += item.velocityY
					
					return true
				})
				accumulator -= settings.updateRate
			}
			items = items
		}
		loop()

		channel.receive = async ({topic, message}) => {
			if (topic === 'reload') {
				reload()
			} else if (topic.startsWith('trigger.')) {
				let triggerID = topic.split('.')[1]
				if (triggerID === 'toss') {
					let item = makeItem()
					console.log('tossing', item)
					items.push(item)
				}
			}
		}

		return () => cancelAnimationFrame(frame)
	})
</script>

<section>
	{#each items as item}
		<div class='item' style="left: {item.x}px; top: {item.y}px; transform: scale({item.scale})">
			{#if settings.items[item.itemIndex].sourceType === 'emoji'}
				{settings.items[item.itemIndex].emoji}️
			{:else if settings.items[item.itemIndex].sourceType === 'asset'}
				{#if settings.items[item.itemIndex].reference?.mimetype?.startsWith('image')}
					<img alt="" src={assets.source(settings.items[item.itemIndex].reference)}/>
				{:else if settings.items[item.itemIndex].reference?.mimetype?.startsWith('video')}
					<video autoplay loop>
						<track kind="captions"/>
						<source src="{assets.source(settings.items[item.itemIndex].reference)}" type="{settings.items[item.itemIndex].reference.mimetype}">
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
</style>