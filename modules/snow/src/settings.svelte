<script type="ts">
	import Icon from '@kettek/litch-app/src/components/Icon.svelte'
	import Button from '@kettek/litch-app/src/components/Button.svelte'
	import type { AssetManager } from '@kettek/litch-app/src/interfaces/Asset'
	import type { SettingsInterface } from './Settings'

	export let settings: SettingsInterface
	
	export let live: any = {}

	export let assets: AssetManager

	export let update: (value: any) => void

	async function openFileDialog() {
		let results = await assets.open({
			multiple: false,
		})
		if (results.length === 0) return
		settings.reference = results[0].reference
		live.reference = settings.reference

		update(settings)
	}
</script>

<div>
	<label>
		<select bind:value={settings.sourceType}>
			<option value='emoji'>emoji</option>
			<option value='asset'>asset</option>
		</select>
	</label>
	{#if settings.sourceType === 'emoji'}
		<label>
			<input type='text' bind:value={settings.emoji}/>
			Emoji
		</label>
	{:else if settings.sourceType === 'asset'}
		<label>
			<input disabled type='text' value={settings.reference}/>
			Asset
			<Button title='Open file' tertiary on:click={openFileDialog}>
				<Icon icon='open'></Icon>
			</Button>
		</label>
		<div class='preview'>
			<img alt='preview' src={settings.reference}/>
		</div>
	{/if}
	<label>
		<input type='number' bind:value={settings.count}/>
		Count
	</label>
	<label>
		<input type='number' bind:value={settings.updateRate}/>
		Update Rate
	</label>
	<label>
		<input type='number' bind:value={settings.maxAccumulator}/>
		Max Accumulator
	</label>
	<label>
		<input type='number' bind:value={settings.spawnX}/>
		X Spawn
	</label>
	<label>
		<input type='number' bind:value={settings.spawnY}/>
		Y Spawn
	</label>
	<label>
		<input type='number' bind:value={settings.minScale}/>
		Min Scale
	</label>
	<label>
		<input type='number' bind:value={settings.scaleRandom}/>
		Random Scale
	</label>
	<label>
		<input type='number' bind:value={settings.size}/>
		Initial Size
	</label>
	<label>
		<input type='number' bind:value={settings.xRandomRate[0]}/>
		<input type='number' bind:value={settings.xRandomRate[1]}/>
		X Random Rate (min, max)
	</label>
	<label>
		<input type='number' bind:value={settings.yRandomRate[0]}/>
		<input type='number' bind:value={settings.yRandomRate[1]}/>
		Y Random Rate (min, max)
	</label>
	<label>
		<input type='checkbox' bind:checked={settings.rotate}/>
		Randomize Starting Rotation
	</label>
	<label>
		<input type='number' bind:value={settings.rotRandomRate[0]}/>
		<input type='number' bind:value={settings.rotRandomRate[1]}/>
		Rotation Random Rate (min, max)
	</label>
	<Button tertiary on:click={()=>{update(settings)}}>
		<Icon icon='checkmark'></Icon>
	</Button>
</div>
