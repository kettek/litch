<script type="ts">
	import Icon from '../../../src/components/Icon.svelte'
	import Button from '../../../src/components/Button.svelte'
	import type { AssetManager } from '../../../src/interfaces/Asset'

	import type { SettingsInterface } from './Settings'
	import type { ModuleChannel } from '../../../src/interfaces/ModuleInstance'

	export let settings: SettingsInterface

	function refresh() {
		settings = { ...settings }
	}

	export let channel: ModuleChannel

	export let assets: AssetManager

	async function openFileDialog(emotionName: string, emotionFace: string) {
		let results = await assets.open({
			multiple: false,
		})
		let emotion = settings.emotions.find(v=>v.name===emotionName)
		if (!emotion) return
		emotion.faces[emotionFace] = {
			...emotion.faces[emotionFace],
			...results[0]
		}
		refresh()
	}

	function addEmotion() {
		let makeSource = () => {
			return {
				open: true,
				collectionUUID: '',
				assetUUID: '',
				reference: '',
			}
		}
		settings.emotions = [
			...settings.emotions,
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
	function removeEmotion(name: string) {
		settings.emotions = settings.emotions.filter(v => v.name !== name)
	}
	export let update: (value: any) => void
</script>

<div>
	<div class='emotions'>
		<Button title='Add Emotion' tertiary on:click={addEmotion}>
			<Icon icon='add'></Icon>
		</Button>
		<details>
			<summary>
				Settings
			</summary>
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
		{#each settings.emotions as emotion}
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
									<img alt='preview' src={imageSource.reference}/>
								</div>
							</article>
						</details>
					{/each}
				</section>
			</details>
		{/each}
	</div>
	<Button title='Apply' tertiary on:click={()=>update(settings)}>
		<Icon icon='apply'></Icon>
	</Button>
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