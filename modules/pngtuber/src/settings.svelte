<script type="ts">
	import Icon from '@kettek/litch-app/src/components/Icon.svelte'
	import Button from '@kettek/litch-app/src/components/Button.svelte'
	import DropList from '@kettek/litch-app/src/components/DropList.svelte'
	import TabBar from '@kettek/litch-app/src/components/TabBar.svelte'
	import Tab from '@kettek/litch-app/src/components/Tab.svelte'
	import ItemGroup from '@kettek/litch-app/src/components/ItemGroup.svelte'
	import ItemBar from '@kettek/litch-app/src/components/ItemBar.svelte'
	import Section from '@kettek/litch-app/src/components/Section.svelte'
	import AssetViewer from '@kettek/litch-app/src/components/AssetViewer.svelte'
	import type { AssetManager } from '@kettek/litch-app/src/interfaces/Asset'

	import type { SettingsInterface, LitchMask } from './Settings'
	import { isLitchTuber, isPuppeteerTuber } from './Settings'
	import type { ModuleChannel, ModuleFormat } from '@kettek/litch-app/src/interfaces/ModuleInstance'
	import { upgrade } from './upgrade'
	import Visualizer from './visualizer.svelte'

	export let settings: SettingsInterface
	export let format: ModuleFormat

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
			let results = await assets.open({
				multiple: false,
			})
			mask.frames[index] = results[0]
			refresh()
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
		<Section alt padded rounded>
			<ItemGroup label>
				<select value={settings.tuber.type} on:change={changeType}>
					<option value='litch'>litch</option>
					<option value='puppeteer'>puppeteer</option>
				</select>
				<svelte:fragment slot='label'>
					{format('tuberType')}
				</svelte:fragment>
			</ItemGroup>
			<ItemGroup label>
				<input type='number' bind:value={settings.sampleRate}/>
				<svelte:fragment slot='label'>
					{format('sampleRate')}
				</svelte:fragment>
			</ItemGroup>
			<ItemGroup label>
				<input type='number' bind:value={settings.sampleLimit}/>
				<svelte:fragment slot='label'>
					{format('sampleLimit')}
				</svelte:fragment>
			</ItemGroup>
			<ItemGroup label>
				<input type='number' bind:value={settings.trigger}/>
				<svelte:fragment slot='label'>
					{format('triggerdB')}
				</svelte:fragment>
			</ItemGroup>
			<Button on:click={enableVisualizer}>
				{format('configureSensitivity')}
			</Button>
			{#if isLitchTuber(settings.tuber)}
				<ItemGroup label>
					<input type='number' bind:value={settings.tuber.framerate}/>
					<svelte:fragment slot='label'>
						{format('framerate')}
					</svelte:fragment>
				</ItemGroup>
			{/if}
		</Section>
		{#if isLitchTuber(settings.tuber)}
			<TabBar>
				{#each settings.tuber.masks as mask, index}
					<Tab tertiary selected={index===selectedMaskIndex} on:click={()=>{litch.selectMask(index)}}>
						{mask.name}
					</Tab>
				{/each}
				<svelte:fragment slot='controls'>
					<Button tertiary small on:click={litch.addMask}>
						<Icon icon='add'></Icon>
					</Button>
				</svelte:fragment>
			</TabBar>
			<ItemBar alt round='top'>
				<Button disabled={!selectedMask} dangerous on:click={()=>{litch.deleteMask(selectedMaskIndex)}} title={format('deleteMask')}>
					<Icon icon='delete'></Icon>
				</Button>
			</ItemBar>
			<Section alt round='bottom' padded>
				{#if !selectedMask}
					{format('selectOrCreateAMask')}
				{:else}
					<ItemGroup label>
						<input bind:value={selectedMask.name}/>
						<svelte:fragment slot='label'>
							{format('name')}
						</svelte:fragment>
					</ItemGroup>
					<DropList tertiary>
						<svelte:fragment slot='heading'>
							{format('tags')}
						</svelte:fragment>
						<section slot='content'>
							<ItemGroup label>
								<input bind:value={pendingTag}/>
								<Button tertiary on:click={()=>litch.addTag(pendingTag)}>
									<Icon icon='add'></Icon>
								</Button>
							</ItemGroup>
							{#each Object.entries(selectedMask.tags) as [tag, checked]}
								<ItemGroup label count={3}>
									<input value={tag} on:change={(e)=>litch.changeTag(e, tag)}/>
									<input type='checkbox' bind:checked={selectedMask.tags[tag]}/>
									<Button dangerous on:click={()=>{litch.removeTag(tag)}}>
										<Icon icon='delete'/>
									</Button>
								</ItemGroup>
							{/each}
						</section>
					</DropList>
					<DropList tertiary>
						<svelte:fragment slot='heading'>
							{format('frames')}
						</svelte:fragment>
						<section slot='content'>
							<section>
								<Button title={format('openFile')} tertiary on:click={()=>{litch.addFileDialog(selectedMask)}}>
									<Icon icon='open'></Icon>
								</Button>
								<Button dangerous on:click={()=>{litch.clearMaskFrames(selectedMaskIndex)}} title={format('clearFrames')}>
									<Icon icon='delete'></Icon>
								</Button>
							</section>
							<section>
							</section>
								{#each selectedMask.frames as frame, index}
									<article class='emotion__face'>
										<Button title={format('openFile')} tertiary on:click={()=>{litch.openFileDialog(selectedMask, index)}}>
											<Icon icon='open'></Icon>
										</Button>
										<AssetViewer asset={assets.get(frame)} contained bg/>
									</article>
								{/each}
						</section>
					</DropList>
				{/if}
			</Section>
		{:else if isPuppeteerTuber(settings.tuber)}
			<Button title={format('addEmotion')} tertiary on:click={puppeteer.addEmotion}>
				<Icon icon='add'></Icon>
			</Button>
			{#each settings.tuber.emotions as emotion}
				<details bind:open={emotion.open} class='emotion'>
					<summary>
						<label>
							<input type='text' placeholder={format('emotionName')} bind:value={emotion.name}/>
						</label>
					</summary>
					<section class='emotion__container'>
						{#each Object.entries(emotion.faces) as [emotionFace, imageSource]}
							<details bind:open={imageSource.open}>
								<summary>
									{emotionFace}
								</summary>
								<article class='emotion__face'>
									<Button title={format('openFile')} tertiary on:click={()=>{openFileDialog(emotion.name, emotionFace)}}>
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