<script type="ts">
	import Icon from '@kettek/litch-app/src/components/Icon.svelte'
	import Button from '@kettek/litch-app/src/components/Button.svelte'
	import type { AssetManager } from '@kettek/litch-app/src/interfaces/Asset'

	import type { SettingsInterface } from './Settings'
	import { isLitchTuber, isPuppeteerTuber } from './Settings'
	import type { ModuleChannel } from '@kettek/litch-app/src/interfaces/ModuleInstance'
	import { upgrade } from './upgrade'

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
</script>

<div>
	<div class='emotions'>
		<Button title='Add Emotion' tertiary on:click={puppeteer.addEmotion}>
			<Icon icon='add'></Icon>
		</Button>
		<details>
			<summary>
				Settings
			</summary>
			<label>
				<select value={settings.tuber.type} on:change={changeType}>
					<option value='litch'>litch</option>
					<option value='puppeteer'>puppeteer</option>
				</select>
				Tubular Type
			</label>
			<label>
				<input type='number' bind:value={settings.sampleRate}/>
				sample rate (ms)
			</label>
			<label>
				<input type='number' bind:value={settings.sampleLimit}/>
				sample limit
			</label>
			<label>
				<input type='number' bind:value={settings.trigger}/>
				trigger dB
			</label>
		</details>
		{#if isLitchTuber(settings.tuber)}
			litch type
		{:else if isPuppeteerTuber(settings.tuber)}
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
</div>

<style>
	summary > label {
		display: inline-block;
	}
	label.file {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto auto;
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