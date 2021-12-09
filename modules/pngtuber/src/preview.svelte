<script type="ts">
	import { onDestroy, onMount } from 'svelte'

	import type { ModuleChannel } from "../../../src/interfaces/ModuleInstance"

	import type { SettingsInterface } from './Settings'
	export let settings: SettingsInterface

	let hasPermission = false
	let permissionFailed = false

	let audioFrame: number
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

		audioFrame = requestAnimationFrame(analyseLoop)
	}

	export let update: (value: any) => void

	export let channel: ModuleChannel
	export let live: any = {}

	let currentFace = ''

	function refreshDb() {
		let total = samples.reduce((previousValue: number, currentValue: number) => {
			return previousValue + currentValue
		}, 0)
		db = total / samples.length

		// eh
		if (db >= settings.trigger) {
			if (currentFace !== 'eyesOpenMouthOpen') {
				currentFace = 'eyesOpenMouthOpen'
				live.reference = settings.emotions[0]?.faces[currentFace].reference
				channel.publish('setImage', {
					reference: live.reference,
					ts: Date.now(),
				})
			}
		} else {
			if (currentFace !== 'eyesOpenMouthClosed') {
				currentFace = 'eyesOpenMouthClosed'
				live.reference = settings.emotions[0]?.faces[currentFace].reference
				channel.publish('setImage', {
					reference: live.reference,
					ts: Date.now(),
				})
			}
		}
	}

	function stop() {
		cancelAnimationFrame(audioFrame)
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

			analyseLoop()
		} catch(err: any) {
			permissionFailed = true
			console.log(err)
		}
	}

	onMount(async () => {
		start()
	})
	onDestroy(() => {
		stop()
	})
</script>

<div>
	{#if hasPermission}
		{#if settings.emotions.length === 0}
			you're emotionless
		{:else}
			<img alt='' src='{live.reference}'/>
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