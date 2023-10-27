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
		sinceLastHit: number
		class: string
		element: HTMLDivElement
		title?: string
		titleColor?: string
	}
	
	interface Collision {
		a: Item
		b: Item
	}

	function hasCollision(collisions: Collision[], item: Item, item2: Item): boolean {
		for (let collision of collisions) {
			if ((collision.a === item || collision.b === item) && (collision.a === item2 || collision.b === item2)) return true
		}
		return false
	}

	function doesCollide(a: Item, b: Item): boolean {
		if (!a.element || !b.element) return false
		let rect = a.element.getBoundingClientRect()
		let otherRect = b.element.getBoundingClientRect()
		
		if (settings.bouncerCircular) {
			// Check for circular collision using rect width as diameter.
			let radius = (settings.bouncerUseHeight ? rect.height : rect.width) / 2
			let otherRadius = (settings.bouncerUseHeight ? otherRect.height : otherRect.width) / 2
			let center = {
				x: rect.x + radius,
				y: rect.y + radius,
			}
			let otherCenter = {
				x: otherRect.x + otherRadius,
				y: otherRect.y + otherRadius,
			}
			let distance = Math.sqrt(Math.pow(center.x - otherCenter.x, 2) + Math.pow(center.y - otherCenter.y, 2))
			return distance < radius + otherRadius
		} else {
			// Return true if rect intersects with otherRect or if otherRect intersects with rect.
			if (rect.x < otherRect.x + otherRect.width &&
				rect.x + rect.width > otherRect.x &&
				rect.y < otherRect.y + otherRect.height &&
				rect.y + rect.height > otherRect.y) {
				return true
			}
			if (otherRect.x < rect.x + rect.width &&
				otherRect.x + otherRect.width > rect.x &&
				otherRect.y < rect.y + rect.height &&
				otherRect.y + otherRect.height > rect.y) {
				return true
			}
		}
		return false
	}

	let items: Item[] = []

	function reload() {
		items = settings.bouncers.map((v, i)=>({
			x: items[i]?.x ?? Math.random() * box.width,
			y: items[i]?.y ?? Math.random() * box.height,
			class: '',
			sinceLastHit: items[i]?.sinceLastHit ?? 0,
			title: v.title,
			titleColor: v.titleColor,
			xvel: items[i]?.xvel ?? (Math.random() < 0.5 ? -1 : 1),
			yvel: items[i]?.yvel ?? (Math.random() < 0.5 ? -1 : 1),
			element: null,
		}))
	}

	reload()
	
	onMount(() => {
		let frame: number

		function loop() {
			let collisions: Collision[] = []
			for (let index = 0; index < items.length; index++) {
				let item = items[index]
				if (!item.element) continue
				let rect = item.element.getBoundingClientRect()
				
				item.x += item.xvel * settings.bouncerSpeed
				item.y += item.yvel * settings.bouncerSpeed
				
				// Bounce off walls.
				if (item.x < 0) {
					item.x = 0
					item.xvel *= -1
					item.sinceLastHit = 0
				}
				if (item.y < 0) {
					item.y = 0
					item.yvel *= -1
					item.sinceLastHit = 0
				}
				if (item.x + rect.width > box.width) {
					item.x = box.width - rect.width
					item.xvel *= -1
					item.sinceLastHit = 0
				}
				if (item.y + rect.height > box.height) {
					item.y = box.height - rect.height
					item.yvel *= -1
					item.sinceLastHit = 0
				}

				if (item.sinceLastHit > settings.jiggleTime ?? 60) {
					item.class = ''
				} else {
					item.class = 'hit'
				}

				item.sinceLastHit++
				
				// Collect collisions.
				for (let i = 0; i < items.length; i++) {
					if (i === index) continue
					if (hasCollision(collisions, item, items[i])) continue
					if (!doesCollide(item, items[i])) continue
					collisions.push({a: item, b: items[i]})
				}
			}

			// Iterate through our collisions.
			for (let collision of collisions) {
				let {a, b} = collision
				let cd = Math.abs(a.x - b.x)
				let rd = Math.abs(a.y - b.y)
				
				let moreVertical = cd < rd

				if (!moreVertical) {
					a.xvel *= -1
					b.xvel *= -1
					if (a.x < b.x) {
						if (settings.bouncerCircular) {
							let rect = a.element.getBoundingClientRect()
							a.x = b.x - (settings.bouncerUseHeight ? rect.height : rect.width)
						} else {
							a.x = b.x - a.element.getBoundingClientRect().width - 1
						}
					} else {
						if (settings.bouncerCircular) {
							let rect = a.element.getBoundingClientRect()
							a.x = b.x + (settings.bouncerUseHeight ? rect.height : rect.width)
						} else {
							a.x = b.x + b.element.getBoundingClientRect().width + 1
						}
					}
				} else {
					a.yvel *= -1
					b.yvel *= -1
					if (a.y < b.y) {
						if (settings.bouncerCircular) {
							let rect = a.element.getBoundingClientRect()
							a.y = b.y - (settings.bouncerUseHeight ? rect.height : rect.width)
						} else {
							a.y = b.y - a.element.getBoundingClientRect().height - 1
						}
					} else {
						if (settings.bouncerCircular) {
							let rect = a.element.getBoundingClientRect()
							a.y = b.y + (settings.bouncerUseHeight ? rect.height : rect.width)
						} else {
							a.y = b.y + b.element.getBoundingClientRect().height + 1
						}
					}
				}
				a.sinceLastHit = 0
				b.sinceLastHit = 0
			}

			items = items
			frame = requestAnimationFrame(loop)
		}
		requestAnimationFrame(loop)

		channel.receive = async ({topic, message}) => {
			if (topic === 'reload' || topic === 'refresh') {
				reload()
			}
		}

		return () => cancelAnimationFrame(frame)
	})
</script>

<section>
	{#each items as item, index}
		{#if settings.bouncers[index]}
			<div bind:this={item.element} style="left: {item.x}px; top: {item.y}px;" class='item {item.class}'>
				{#if settings.bouncers[index].reference?.mimetype?.startsWith('image')}
					<img style="min-width: {settings.minBouncerWidth}px; max-width: {settings.maxBouncerWidth}px; min-height: {settings.minBouncerHeight}px; max-height: {settings.maxBouncerHeight}px" alt="" src={assets.source(settings.bouncers[index].reference)}/>
				{:else if settings.bouncers[index].reference?.mimetype?.startsWith('video')}
					<video style="min-width: {settings.minBouncerWidth}px; max-width: {settings.maxBouncerWidth}px; min-height: {settings.minBouncerHeight}px; max-height: {settings.maxBouncerHeight}px" autoplay loop>
						<track kind="captions"/>
						<source src="{assets.source(settings.bouncers[index].reference)}" type="{settings.bouncers[index].reference.mimetype}">
					</video>
				{/if}
				{#if item.title}
					<span class='title' style="color:{item.titleColor}">{item.title}</span>
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
	.item.hit {
		animation: bounce 0.5s infinite;
	}
	.title {
		position: absolute;
		bottom: -2ch;
		left: 0;
		right: 0;
		text-align: center;
		font-weight: 800;
	}
	@keyframes bounce {
		from, to { transform: scale(1, 1); }
		10% { transform: scale(0.8, 1.2); }
		50% { transform: scale(1.2, 0.8); }
		75% { transform: scale(0.95, 1.05); }
	}
</style>