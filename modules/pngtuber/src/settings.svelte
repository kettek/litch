<script type="ts">
	import Icon from '@kettek/litch-app/src/components/Icon.svelte'
	import Button from '@kettek/litch-app/src/components/Button.svelte'
	import DropList from '@kettek/litch-app/src/components/DropList.svelte'
	import type { AssetManager } from '@kettek/litch-app/src/interfaces/Asset'

	import type { SettingsInterface, LitchMask } from './Settings'
	import { isLitchTuber, isPuppeteerTuber } from './Settings'
	import type { ModuleChannel } from '@kettek/litch-app/src/interfaces/ModuleInstance'
	import { upgrade } from './upgrade'
	import Visualizer from './visualizer.svelte'

	export let settings: SettingsInterface

	export let update: (v: any) => void

	let [changed, settings_] = upgrade(settings)
	if (changed) {
		update(settings_)
	}

	function refresh() {
		settings = { ...settings }
	}

	export let channel: ModuleChannel
	export let live: any = {}

	export let assets: AssetManager

	async function openFileDialog(emotionName: string, emotionFace: string) {
		let results = await assets.open({
			multiple: false,
		})
		if (isLitchTuber(settings.tuber)) {
			console.log('tododo')
		} else if (isPuppeteerTuber(settings.tuber)) {
			let emotion = settings.tuber.emotions.find(v=>v.name===emotionName)
			if (!emotion) return
			emotion.faces[emotionFace] = {
				...emotion.faces[emotionFace],
				reference: results[0],
			}
		}
		refresh()
	}

	function changeType(e: any) {
		if (e.target.value === settings.tuber.type) return
		if (e.target.value === 'litch') {
			delete settings['tuber']
			settings.tuber = {
				type: 'litch',
				masks: [],
				framerate: 12,
			}
		} else if (e.target.value === 'puppeteer') {
			delete settings['tuber']
			settings.tuber = {
				type: 'puppeteer',
				emotions: [],
			}
		}
		refresh()
	}

	let pendingTag: string = ''
	let selectedMaskIndex: number = 0
	$: selectedMask = isLitchTuber(settings.tuber) ? settings.tuber.masks[selectedMaskIndex] : null
	let litch = {
		addMask: () => {
			if (!isLitchTuber(settings.tuber)) return
			settings.tuber.masks.push({
				name: `mask ${settings.tuber.masks.length+1}`,
				tags: {},
				frames: [],
			})
			refresh()
		},
		deleteMask: (index: number) => {
			if (!isLitchTuber(settings.tuber)) return
			settings.tuber.masks = settings.tuber.masks.filter((_, i) => i !== index)
		},
		selectMask: (index: number) => {
			selectedMaskIndex = index
		},
		clearMaskFrames: (index: number) => {
			if (!isLitchTuber(settings.tuber)) return
			settings.tuber.masks[index].frames = []
		},
		openFileDialog: async (mask: LitchMask, index: number) => {
			console.log("TODO")
		},
		addFileDialog: async (mask: LitchMask) => {
			let results = await assets.open({
				multiple: true,
			})
			mask.frames = [
				...mask.frames,
				...results,
			]
			refresh()
		},
		addTag: (tag: string) => {
			selectedMask.tags[tag] = true
			refresh()
		},
		removeTag: (tag: string) => {
			if (selectedMask.tags[tag]) {
				delete selectedMask.tags[tag]
			}
			refresh()
		},
		changeTag: (e: any, tag: string) => {
			if (e.target.value === selectedMask.tags[tag]) return
			selectedMask.tags[e.target.value] = selectedMask.tags[tag]
			delete selectedMask.tags[tag]
			refresh()
		},
	}

	let puppeteer = {
		addEmotion: () => {
			let makeSource = () => {
				return {
					open: true,
					reference: {
						collection: '',
						asset: '',
						mimetype: '',
						name: '',
					},
				}
			}
			if (isPuppeteerTuber(settings.tuber)) {
				settings.tuber.emotions = [
					...settings.tuber.emotions,
					{
						name: '',
						open: true,
						faces: {
							eyesOpenMouthOpen: makeSource(),
							eyesOpenMouthClosed: makeSource(),
							eyesClosedMouthOpen: makeSource(),
							eyesClosedMouthClosed: makeSource(),
						},
					}
				]
			}
		},
		removeEmotion: (name: string) => {
			if (isPuppeteerTuber(settings.tuber)) {
				settings.tuber.emotions = settings.tuber.emotions.filter(v => v.name !== name)
			}
		}
	}
	// Visualizer/microphone stuff
	let audioFrame: Timer
	let audioContext: AudioContext
	let audioStream: MediaStreamAudioSourceNode
	let audioAnalyser: AnalyserNode
	let frequencyArray: Uint8Array
	let frequencyData: number[]
	let visualizer = {
		start: async () => {
			let stream = await navigator.mediaDevices.getUserMedia({audio: true})

			audioContext = new AudioContext()

			audioStream = audioContext.createMediaStreamSource(stream)
			audioAnalyser = audioContext.createAnalyser()

			let fftSize = 64
			audioAnalyser.fftSize = fftSize
			audioStream.connect(audioAnalyser)

			let bufferLength = audioAnalyser.frequencyBinCount
			frequencyArray = new Uint8Array(bufferLength)

			audioFrame = setInterval(() => {
				visualizer.loop()
			}, 0)
		},
		stop: async () => {
			if (audioContext) {
				clearInterval(audioFrame)
				audioAnalyser.disconnect()
				audioStream.disconnect()
				await audioContext.close()
				audioContext = undefined
			}
		},
		loop: () => {
			audioAnalyser.getByteFrequencyData(frequencyArray)
			frequencyData = Array.from(frequencyArray)
		},
	}
	let showVisualizer = false
	async function enableVisualizer() {
		await visualizer.start()
		showVisualizer = true
	}
</script>

<div>
	<div class='emotions'>
		<DropList tertiary>
			<svelte:fragment slot='heading'>
				Settings
			</svelte:fragment>
			<section slot='content'>
				<label>
					<select value={settings.tuber.type} on:change={changeType}>
						<option value='litch'>litch</option>
						<option value='puppeteer'>puppeteer</option>
					</select>
					<span> Tubular Type </span>
				</label>
				<label>
					<input type='number' bind:value={settings.sampleRate}/>
					<span>sample rate (ms)</span>
				</label>
				<label>
					<input type='number' bind:value={settings.sampleLimit}/>
					<span>sample limit</span>
				</label>
				<label>
					<input type='number' bind:value={settings.trigger}/>
					<span>trigger dB</span>
				</label>
				<Button on:click={enableVisualizer}>configure sensitivity</Button>
				{#if isLitchTuber(settings.tuber)}
					<label>
						<input type='number' bind:value={settings.tuber.framerate}/>
						<span>framerate (ms)</span>
					</label>
				{/if}
			</section>
		</DropList>
		{#if isLitchTuber(settings.tuber)}
			<nav>
				{#each settings.tuber.masks as mask, index}
					<Button tertiary border invert={index!==selectedMaskIndex} on:click={()=>{litch.selectMask(index)}}>
						{index+1}
					</Button>
				{/each}
				<Button tertiary on:click={litch.addMask}>
					<Icon icon='add'></Icon>
				</Button>
			</nav>
			<section>
				{#if !selectedMask}
					Select or create a mask
				{:else}
					<Button dangerous on:click={()=>{litch.deleteMask(selectedMaskIndex)}} title='Delete mask'>
						<Icon icon='delete'></Icon>
					</Button>
					<label>
						<input bind:value={selectedMask.name}/>
						<span>Name</span>
					</label>
					<DropList tertiary>
						<svelte:fragment slot='heading'>
							Tags
						</svelte:fragment>
						<section slot='content'>
							<label>
								<input bind:value={pendingTag}/>
								<Button tertiary on:click={()=>litch.addTag(pendingTag)}>
									<Icon icon='add'></Icon>
								</Button>
							</label>
							{#each Object.entries(selectedMask.tags) as [tag, checked]}
								<article class='input__tag'>
									<input value={tag} on:change={(e)=>litch.changeTag(e, tag)}/>
									<input type='checkbox' bind:checked={selectedMask.tags[tag]}/>
									<Button dangerous on:click={()=>{litch.removeTag(tag)}}>
										<Icon icon='delete'/>
									</Button>
								</article>
							{/each}
						</section>
					</DropList>
					<DropList tertiary>
						<svelte:fragment slot='heading'>
							Frames
						</svelte:fragment>
						<section slot='content'>
							<section>
								<Button title='Open file' tertiary on:click={()=>{litch.addFileDialog(selectedMask)}}>
									<Icon icon='open'></Icon>
								</Button>
								<Button dangerous on:click={()=>{litch.clearMaskFrames(selectedMaskIndex)}} title='Clear mask frames'>
									<Icon icon='delete'></Icon>
								</Button>
							</section>
							<section>
							</section>
								{#each selectedMask.frames as frame, index}
									<article class='emotion__face'>
										<Button title='Open file' tertiary on:click={()=>{litch.openFileDialog(selectedMask, index)}}>
											<Icon icon='open'></Icon>
										</Button>
										<div class='face'>
											<img alt='preview' src={assets.source(frame)}/>
											</div>
									</article>
								{/each}
						</section>
					</DropList>
				{/if}
			</section>
		{:else if isPuppeteerTuber(settings.tuber)}
			<Button title='Add Emotion' tertiary on:click={puppeteer.addEmotion}>
				<Icon icon='add'></Icon>
			</Button>
			{#each settings.tuber.emotions as emotion}
				<details bind:open={emotion.open} class='emotion'>
					<summary>
						<label>
							<input type='text' placeholder='emotion name' bind:value={emotion.name}/>
						</label>
					</summary>
					<section class='emotion__container'>
						{#each Object.entries(emotion.faces) as [emotionFace, imageSource]}
							<details bind:open={imageSource.open}>
								<summary>
									{emotionFace}
								</summary>
								<article class='emotion__face'>
									<Button title='Open file' tertiary on:click={()=>{openFileDialog(emotion.name, emotionFace)}}>
										<Icon icon='open'></Icon>
									</Button>
									<div class='face'>
										<img alt='preview' src={assets.source(imageSource.reference)}/>
									</div>
								</article>
							</details>
						{/each}
					</section>
				</details>
			{/each}
		{/if}
	</div>
	<Visualizer bind:shown={showVisualizer} frequencyData={frequencyData}/>
</div>

<style>
	summary > label {
		display: inline-block;
	}
	label {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
	}
	label span {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.input__tag {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto auto;
		align-items: center;
	}
	.emotion__container {
		padding: .5em;
	}
	.emotion__face {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
	}
	.face {
		display: grid;
	}
	.face img {
		max-width: 100%;
		background: var(--bar-bg);
		box-shadow: inset 0 0 1em 0 black;
	}
</style>