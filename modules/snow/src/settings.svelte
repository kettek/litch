<script type="ts">
	import Icon from '@kettek/litch-app/src/components/Icon.svelte'
	import Button from '@kettek/litch-app/src/components/Button.svelte'
	import type { AssetManager, AssetResult } from '@kettek/litch-app/src/interfaces/Asset'
	import type { ModuleChannel } from '@kettek/litch-app/src/interfaces/ModuleInstance'
	import { defaultGroup, SettingsInterface } from './SettingsI'
	import { upgrade } from './upgrade'

	export let settings: SettingsInterface

	export let update: (v: any) => void

	let [changed, settings_] = upgrade(settings)
	if (changed) {
		update(settings_)
	}

	export let assets: AssetManager

	let selectedIndex: number = 0
	$: currentGroup = settings.groups[selectedIndex]

	async function openFileDialog(index: number) {
		let results = await assets.open({
			multiple: false,
		})
		if (results.length === 0) return
		settings.groups[index].reference = results[0] as AssetResult
	}

	function addGroup() {
		settings.groups.push(JSON.parse(JSON.stringify(defaultGroup)))
		settings = settings
	}
	function removeGroup(index: number) {
		settings.groups = settings.groups.filter((_, i) => i !== index)
		settings = settings
	}
	function selectGroup(index: number) {
		selectedIndex = index
	}
</script>

<main>
	<header>
		<label>
			<input type='number' bind:value={settings.updateRate}/>
			Update Rate
		</label>
		<label>
			<input type='number' bind:value={settings.maxAccumulator}/>
			Max Accumulator
		</label>
	</header>
	<nav>
		{#each settings.groups as group, index}
			<Button tertiary border invert={index!==selectedIndex} on:click={()=>{selectGroup(index)}}>
				{index+1}
			</Button>
		{/each}
		<Button tertiary on:click={addGroup}>
			<Icon icon='add'></Icon>
		</Button>
	</nav>
	<section>
		{#if !currentGroup}
			Select or create a group
		{:else}
			<Button dangerous on:click={()=>{removeGroup(selectedIndex)}}>
				<Icon icon='delete'></Icon>
			</Button>
			<label>
				<select bind:value={currentGroup.sourceType}>
					<option value='emoji'>emoji</option>
					<option value='asset'>asset</option>
				</select>
				Type
			</label>
			{#if currentGroup.sourceType === 'emoji'}
				<label>
					<input type='text' bind:value={currentGroup.emoji}/>
					Emoji
				</label>
			{:else if currentGroup.sourceType === 'asset'}
				<label>
					<input type='hidden'/>
					Asset
					<Button title='Open file' tertiary on:click={()=>{openFileDialog(selectedIndex)}}>
						<Icon icon='open'></Icon>
					</Button>
				</label>
				<div class='preview'>
					{#if currentGroup.reference?.mimetype?.startsWith('image')}
						<img alt='preview' src={assets.source(currentGroup.reference)}/>
					{:else if currentGroup.reference?.mimetype?.startsWith('video')}
						<video autoplay loop>
							<track kind="captions"/>
							<source src="{assets.source(currentGroup.reference)}" type="{currentGroup.reference.mimetype}">
						</video>
					{:else}
						unsupported asset
					{/if}
				</div>
			{/if}
			<label>
				<input type='number' bind:value={currentGroup.size}/>
				Base Size
			</label>
			<hr/>
			<span>Reload Required</span>
			<label>
				<input type='number' bind:value={currentGroup.count}/>
				Count
			</label>
			<label>
				<input type='number' bind:value={currentGroup.spawnX}/>
				X Spawn
			</label>
			<label>
				<input type='number' bind:value={currentGroup.spawnY}/>
				Y Spawn
			</label>
			<label>
				<input type='number' bind:value={currentGroup.minScale}/>
				Min Scale
			</label>
			<label>
				<input type='number' bind:value={currentGroup.scaleRandom}/>
				Random Scale
			</label>
			<label>
				<input type='number' bind:value={currentGroup.xRandomRate[0]}/>
				<input type='number' bind:value={currentGroup.xRandomRate[1]}/>
				X Random Rate (min, max)
			</label>
			<label>
				<input type='number' bind:value={currentGroup.yRandomRate[0]}/>
				<input type='number' bind:value={currentGroup.yRandomRate[1]}/>
				Y Random Rate (min, max)
			</label>
			<label>
				<input type='checkbox' bind:checked={currentGroup.rotate}/>
				Randomize Starting Rotation
			</label>
			<label>
				<input type='number' bind:value={currentGroup.rotRandomRate[0]}/>
				<input type='number' bind:value={currentGroup.rotRandomRate[1]}/>
				Rotation Random Rate (min, max)
			</label>
		{/if}
	</section>
</main>

<style>
	main {
		display: grid;
		grid-template-rows: auto auto minmax(0, 1fr);
		overflow: auto;
		height: 100%;
	}
	section {
		overflow: auto;
	}
	input[type=number] {
		width: 5em;
	}
	.preview > * {
		max-height: 8em;
		max-width: 8em;
		object-fit: contain;
	}
	hr {
		width: 100%;
		border-color: var(--text);
	}
</style>