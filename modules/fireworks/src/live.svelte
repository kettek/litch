<script type="ts">
	import { onMount } from 'svelte'

	import type { ModuleChannel } from '@kettek/litch-app/src/interfaces/ModuleInstance'
	import type { AssetManager } from '@kettek/litch-app/src/interfaces/Asset'
	import type { SettingsInterface, SpawnGroup, SpawnItem } from './SettingsI'

	export let channel: ModuleChannel
	export let assets: AssetManager
	export let settings: SettingsInterface

	interface Rocket {
		rocketIndex: number
		group: SpawnGroup
		y: number
		x: number
		deathtime: number
	}

	interface Particle {
		payload: SpawnItem
		age: number
		sy: number
		sx: number
		vy: number
		vx: number
		y: number
		x: number
		weight: number
		birth: number
		lifetime: number
		opacity: number
	}

	let rockets: Rocket[] = []
	let particles: Particle[] = []

	function reload() {
		rockets = []
		particles = []
		groupTimers = settings.groups.map(v => {
			return {
				lastLaunch: 0,
				nextLaunch: performance.now() + Math.random() * (v.launchRateMax - v.launchRateMin) + v.launchRateMin
			}
		})
	}

	interface GroupTimer {
		lastLaunch: number
		nextLaunch: number
	}

	let groupTimers: GroupTimer[] = []

	reload()
	$: settings ? reload : null

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
				// Check for rocket group spawning.
				for (let i = 0; i < settings.groups.length; i++) {
					let group = settings.groups[i]
					if (currFrame >= groupTimers[i].nextLaunch) {
						// add rocket!
						rockets.push({
							rocketIndex: i,
							group: group,
							y: 100,
							x: Math.random() * 100,
							deathtime: currFrame + Math.random() * (group.explosionDelayMax - group.explosionDelayMin) + group.explosionDelayMin
						})
						groupTimers[i].nextLaunch = currFrame + Math.random() * (group.launchRateMax - group.launchRateMin) + group.launchRateMin
					}
				}

				// Destroy old rockets.
				rockets = rockets.filter(v => {
					if (currFrame >= v.deathtime) {
						for (let p of v.group.payload) {
							let particleCount = Math.random() * (p.countMax - p.countMin) + p.countMin
							for (let i = 0; i < particleCount; i++) {
								let particle = {
									payload: p,
									vx: Math.random() * (p.force - -p.force) + -p.force,
									vy: Math.random() * (p.force - -p.force) + -p.force,
									sx: v.x,
									sy: v.y,
									x: v.x,
									y: v.y,
									age: 0,
									weight: (Math.random() * (p.weightMax - p.weightMin) + p.weightMin) / 2,
									birth: currFrame,
									lifetime: Math.random() * (p.lifetimeMax - p.lifetimeMin) + p.lifetimeMin,
									opacity: 1,
								}
								particles.push(particle)
							}
						}
						return false
					}
					return true
				})

				// Move remaining rockets.
				rockets.forEach(v => {
					v.y -= v.group.rocket.force
				})

				// Destroy old particles.
				particles = particles.filter(v => currFrame < v.birth+v.lifetime)

				// Move particles.
				particles.forEach(v => {
					v.age++
					v.x = v.sx + v.vx * v.age
					v.y = v.sy + v.vy * v.age + v.weight * v.age * v.weight * v.age
					v.opacity = 1 - ((currFrame - v.birth) / v.lifetime)
				})

				accumulator -= settings.updateRate
			}
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
	{#each rockets as rocket}
		<div style="left: {rocket.x}%; top: {rocket.y}%; transform: scale({settings.groups[rocket.rocketIndex].rocket.size});" class='item'>
			{#if rocket.group.rocket.sourceType === 'emoji'}
				{rocket.group.rocket.emoji}️
			{:else if rocket.group.rocket.sourceType === 'particle'}
				<div class='particle' style="background: {rocket.group.rocket.color}"></div>
			{:else if rocket.group.rocket.sourceType === 'asset'}
				{#if rocket.group.rocket.reference?.mimetype?.startsWith('image')}
					<img alt="" src={assets.source(rocket.group.rocket.reference)}/>
				{:else if rocket.group.rocket.reference?.mimetype?.startsWith('video')}
					<video autoplay loop>
						<track kind="captions"/>
						<source src="{assets.source(rocket.group.rocket.reference)}" type="{rocket.group.rocket.reference.mimetype}">
					</video>
				{/if}
			{/if}
		</div>
	{/each}
	{#each particles as particle}
		<div style="left: {particle.x}%; top: {particle.y}%; opacity: {particle.opacity}; transform: scale({particle.payload.size}); color: {particle.payload.color};" class='item'>
			{#if particle.payload.sourceType === 'emoji'}
				{particle.payload.emoji}️
			{:else if particle.payload.sourceType === 'particle'}
				<div class='particle' style="background: {particle.payload.color}"></div>
			{:else if particle.payload.sourceType === 'asset'}
				{#if particle.payload.reference?.mimetype?.startsWith('image')}
					<img alt="" src={assets.source(particle.payload.reference)}/>
				{:else if particle.payload.reference?.mimetype?.startsWith('video')}
					<video autoplay loop>
						<track kind="captions"/>
						<source src="{assets.source(particle.payload.reference)}" type="{particle.payload.reference.mimetype}">
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
	.particle {
		position: absolute;
		width: 1em;
		height: 1em;
		border-radius: 10em;
	}
</style>