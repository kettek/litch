<script type="ts">
	import { onDestroy, onMount } from 'svelte'
	import { upgrade } from './upgrade'

	import type { ModuleChannel } from "@kettek/litch-app/src/interfaces/ModuleInstance"

	import { isLitchTuber, isPuppeteerTuber, LitchMask } from './Settings'
	import { isLitchTuber, isPuppeteerTuber, LitchMask, LitchTuber } from './Settings'
	import type { SettingsInterface } from './Settings'
	export let settings: SettingsInterface

	import type { AssetManager } from '@kettek/litch-app/src/interfaces/Asset'
	export let assets: AssetManager

	let hasPermission = false
	let permissionFailed = false

	let audioFrame: Timer
	let audioContext: AudioContext
	let audioStream: MediaStreamAudioSourceNode
	let audioAnalyser: AnalyserNode

	let frequencyArray: Uint8Array

	let lastTime = performance.now()
	let currTime = performance.now()
	let samples: number[] = []
	let accumulator = 0
	let db: number

	let analyseLoop = () => {
		currTime = performance.now()
		let delta = currTime - lastTime
		accumulator += delta
		lastTime = currTime

		if (accumulator >= settings.sampleRate) {
			audioAnalyser.getByteFrequencyData(frequencyArray)
			let total = 0
			for (let i = 0; i < 255; i++) {
				let x = frequencyArray[i];
				total += x * x;
			}
			let rms = Math.sqrt(total / frequencyArray.byteLength);
			let db = 20 * ( Math.log(rms) / Math.log(10) );
			db = Math.max(db, 0); // sanity check

			samples.push(db)

			if (samples.length > settings.sampleLimit) {
				samples.shift()
			}
			refreshDb()

			accumulator = 0
		}

		litchLoop(delta)
	}

	export let update: (value: any) => void

	let [changed, settings_] = upgrade(settings)
	if (changed) {
		update(settings_)
	}

	export let channel: ModuleChannel
	export let live: any = {}

	let currentFace = ''

	let litchAccumulator: number = 0
	let litchFrameIndex: number = 0
	let litchStates = {
		'eyes': true,
		'mouth': false,
	}
	function getLitchMask(tuber: LitchTuber, states: any): LitchMask {
		for (let mask of tuber.masks) {
			let mismatch = false
			for (let [tag, open] of Object.entries(states)) {
				if (mask.tags[tag] !== open) {
					mismatch = true
					break
				}
			}
			if (!mismatch) {
				return mask
			}
		}
	}
	function litchLoop(delta: number) {
		if (!isLitchTuber(settings.tuber)) return

		let mask = getLitchMask(settings.tuber, litchStates)
		if (!mask) {
			return
		}

		litchAccumulator += delta

		while (litchAccumulator >= settings.tuber.framerate) {
			litchFrameIndex = (litchFrameIndex+1) % mask.frames.length
			channel.publish('setImage', {
				reference: mask.frames[litchFrameIndex],
				ts: Date.now(),
			})

			litchAccumulator -= settings.tuber.framerate
		}
	}

	function refreshDb() {
		let total = samples.reduce((previousValue: number, currentValue: number) => {
			return previousValue + currentValue
		}, 0)
		db = total / samples.length

		refreshLitch(db)
		refreshPuppeteer(db)
	}

	function refreshLitch(db: number) {
		if (db >= settings.trigger) {
			litchStates.mouth = true
		} else {
			litchStates.mouth = false
		}
	}

	function refreshPuppeteer(db: number) {
		if (!isPuppeteerTuber(settings.tuber)) return
		// eh
		if (db >= settings.trigger) {
			if (currentFace !== 'eyesOpenMouthOpen') {
				currentFace = 'eyesOpenMouthOpen'
				channel.publish('setImage', {
					reference: settings.tuber.emotions[0]?.faces[currentFace].reference,
					ts: Date.now(),
				})
			}
		} else {
			if (currentFace !== 'eyesOpenMouthClosed') {
				currentFace = 'eyesOpenMouthClosed'
				channel.publish('setImage', {
					reference: settings.tuber.emotions[0]?.faces[currentFace].reference,
					ts: Date.now(),
				})
			}
		}
	}

	function stop() {
		clearInterval(audioFrame)
	}

	async function start() {
		try {
			let stream = await navigator.mediaDevices.getUserMedia({audio: true})
			permissionFailed = false
			hasPermission = true

			audioContext = new AudioContext()

			audioStream = audioContext.createMediaStreamSource(stream)
			audioAnalyser = audioContext.createAnalyser()

			let fftSize = 1024
			audioAnalyser.fftSize = fftSize
			audioStream.connect(audioAnalyser)

			let bufferLength = audioAnalyser.frequencyBinCount
			frequencyArray = new Uint8Array(bufferLength)

			audioFrame = setInterval(() => {
				analyseLoop()
			}, 0)
		} catch(err: any) {
			permissionFailed = true
			console.log(err)
		}
	}

	onMount(async () => {
		start()
		channel.receive = async ({topic, message}) => {
			if (topic === 'update') {
				if (isLitchTuber(message.tuber)) {
					let mask = getLitchMask(message.tuber, {eyes: true, mouth: false})
					if (!mask) return
					channel.publish('setImage', {
						reference: mask.frames[0],
						ts: Date.now(),
					})
				} else if (isPuppeteerTuber(message.tuber)) {
					channel.publish('setImage', {
						reference: message.tuber?.emotions[0]?.faces[currentFace]?.reference,
						ts: Date.now(),
					})
				}
			} else if (topic === 'setImage') {
				live.reference = message.reference
			}
		}
	})
	onDestroy(() => {
		stop()
	})
</script>

<div>
	{#if hasPermission}
		{#if isLitchTuber(settings.tuber)}
			{#if settings.tuber.masks.length === 0}
				you're maskless
			{:else}
				<img alt='' src='{assets.source(live.reference)}'/>
			{/if}
		{:else if isPuppeteerTuber(settings.tuber)}
			{#if settings.tuber.emotions.length === 0}
				you're emotionless
			{:else}
				<img alt='' src='{assets.source(live.reference)}'/>
			{/if}
		{/if}
	{:else}
		plz grant permies
	{/if}
</div>

<style>
	div {
		width: 100%;
		height: 100%;
		color: white;
	}
	img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
</style>