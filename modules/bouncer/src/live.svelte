<script type="ts">
	import { onMount } from 'svelte'

	import type { ModuleChannel } from '@kettek/litch-app/src/interfaces/ModuleInstance'
	import type { AssetManager } from '@kettek/litch-app/src/interfaces/Asset'
  import type { BoxInterface } from '@kettek/litch-app/src/interfaces/Box'
	import type { SettingsInterface } from './SettingsI'

	export let channel: ModuleChannel
	export let assets: AssetManager
	export let settings: SettingsInterface
	export let box: BoxInterface
	
	interface Item {
		x: number
		y: number
		xvel: number
		yvel: number
		hits: number
		others: number[]
		element: HTMLDivElement
	}

	let items: Item[] = []

	function reload() {
		items = settings.bouncers.map(v=>({
			x: Math.random() * box.width,
			y: Math.random() * box.height,
			hits: 0,
			others: [],
			xvel: Math.random() < 0.5 ? -1 : 1,
			yvel: Math.random() < 0.5 ? -1 : 1,
			element: null,
		}))
	}

	reload()
	
	onMount(() => {
		let frame: number

		function loop() {
			items = items.map(v=>({...v, others: []}))
			for (let index = 0; index < items.length; index++) {
				let item = items[index]
				if (!item.element) continue
				let rect = item.element.getBoundingClientRect()
				
				item.x += item.xvel * settings.bouncerSpeed
				item.y += item.yvel * settings.bouncerSpeed
				
				if (item.hits > 0) {
					item.hits--
					
					// Bounce off of any other items.
					for (let i = 0; i < items.length; i++) {
						if (i === index) continue
						if (item.others.includes(i)) continue
						let other = items[i]
						if (!other.element) continue
						let otherRect = other.element.getBoundingClientRect()
						if (rect.left < otherRect.right && rect.right > otherRect.left && rect.top < otherRect.bottom && rect.bottom > otherRect.top) {
							item.others.push(i)
							other.others.push(index)
							item.xvel = -item.xvel
							item.yvel = -item.yvel
							break
						}
					}
				}

				if (rect.left < 0) {
					item.x = 0
					item.xvel = -item.xvel
					item.hits++
				} else if (rect.right > box.width) {
					item.x = box.width-rect.width
					item.xvel = -item.xvel
					item.hits++
				}
				if (rect.top < 0) {
					item.y = 0
					item.yvel = -item.yvel
					item.hits++
				} else if (rect.bottom > box.height) {
					item.y = box.height-rect.height
					item.yvel = -item.yvel
					item.hits++
				}
			}

			items = items
			frame = requestAnimationFrame(loop)
		}
		requestAnimationFrame(loop)

		channel.receive = async ({topic, message}) => {
			if (topic === 'reload') {
				reload()
			}
		}

		return () => cancelAnimationFrame(frame)
	})
</script>

<section>
	{#each items as item, index}
		{#if settings.bouncers[index]}
			<div bind:this={item.element} style="left: {item.x}px; top: {item.y}px;" class='item'>
				{#if settings.bouncers[index].reference?.mimetype?.startsWith('image')}
					<img style="min-width: {settings.minBouncerWidth}px; max-width: {settings.maxBouncerWidth}px; min-height: {settings.minBouncerHeight}px; max-height: {settings.maxBouncerHeight}px" alt="" src={assets.source(settings.bouncers[index].reference)}/>
				{:else if settings.bouncers[index].reference?.mimetype?.startsWith('video')}
					<video style="min-width: {settings.minBouncerWidth}px; max-width: {settings.maxBouncerWidth}px; min-height: {settings.minBouncerHeight}px; max-height: {settings.maxBouncerHeight}px" autoplay loop>
						<track kind="captions"/>
						<source src="{assets.source(settings.bouncers[index].reference)}" type="{settings.bouncers[index].reference.mimetype}">
					</video>
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
	img, video {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}
</style>