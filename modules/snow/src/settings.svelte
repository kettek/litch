<script type="ts">
	import Icon from '@kettek/litch-app/src/components/Icon.svelte'
	import Button from '@kettek/litch-app/src/components/Button.svelte'
	import type { AssetManager, AssetResult } from '@kettek/litch-app/src/interfaces/Asset'
	import type { ModuleChannel } from '@kettek/litch-app/src/interfaces/ModuleInstance'
	import type { SettingsInterface } from './SettingsI'

	export let settings: SettingsInterface
	
	export let live: any = {}
	export let channel: ModuleChannel

	export let assets: AssetManager

	async function openFileDialog() {
		let results = await assets.open({
			multiple: false,
		})
		if (results.length === 0) return
		settings.reference = results[0] as AssetResult
		live.reference = settings.reference
	}
</script>

<main>
	<label>
		<select bind:value={settings.sourceType}>
			<option value='emoji'>emoji</option>
			<option value='asset'>asset</option>
		</select>
		Type
	</label>
	{#if settings.sourceType === 'emoji'}
		<label>
			<input type='text' bind:value={settings.emoji}/>
			Emoji
		</label>
	{:else if settings.sourceType === 'asset'}
		<label>
			<input type='hidden'/>
			Asset
			<Button title='Open file' tertiary on:click={openFileDialog}>
				<Icon icon='open'></Icon>
			</Button>
		</label>
		<div class='preview'>
			{#if settings.reference?.mimetype?.startsWith('image')}
				<img alt='preview' src={assets.source(settings.reference)}/>
			{:else if settings.reference?.mimetype?.startsWith('video')}
				<video autoplay loop>
					<track kind="captions"/>
					<source src="{assets.source(settings.reference)}" type="{settings.reference.mimetype}">
				</video>
			{:else}
				unsupported asset
			{/if}
		</div>
	{/if}
	<label>
		<input type='number' bind:value={settings.size}/>
		Base Size
	</label>
	<label>
		<input type='number' bind:value={settings.updateRate}/>
		Update Rate
	</label>
	<label>
		<input type='number' bind:value={settings.maxAccumulator}/>
		Max Accumulator
	</label>
	<hr/>
	<span>Reload Required</span>
	<label>
		<input type='number' bind:value={settings.count}/>
		Count
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
</main>

<style>
	main {
		display: grid;
		grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
		overflow: auto;
	}
	input[type=number] {
		width: 5em;
	}
	hr {
		width: 100%;
		border-color: var(--text);
	}
</style>