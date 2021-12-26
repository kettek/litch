<script type="ts">
	import Info from '@kettek/litch-app/src/components/Info.svelte'
	import Icon from '@kettek/litch-app/src/components/Icon.svelte'
	import ItemBar from '@kettek/litch-app/src/components/ItemBar.svelte'
	import Button from '@kettek/litch-app/src/components/Button.svelte'
	import Tab from '@kettek/litch-app/src/components/Tab.svelte'
	import TabBar from '@kettek/litch-app/src/components/TabBar.svelte'
	import Section from '@kettek/litch-app/src/components/Section.svelte'
	import type { AssetManager, AssetResult } from '@kettek/litch-app/src/interfaces/Asset'
	import type { ModuleChannel, ModuleFormat } from '@kettek/litch-app/src/interfaces/ModuleInstance'
	import { defaultGroup, SettingsInterface } from './SettingsI'
	import { upgrade } from './upgrade'

	export let format: ModuleFormat

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
	function duplicateGroup(index: number) {
		let newGroup = JSON.parse(JSON.stringify(settings.groups[index]))
		settings.groups.splice(index, 0, newGroup)
		settings = settings
	}
</script>

<main>
	<Section alt rounded padded>
		<label>
			<input type='number' bind:value={settings.updateRate}/>
			{format('updateRate')}
		</label>
		<label>
			<input type='number' bind:value={settings.maxAccumulator}/>
			{format('maxAccumulator')}
		</label>
	</Section>
	<TabBar>
		{#each settings.groups as group, index}
			<Tab tertiary selected={index===selectedIndex} on:click={()=>{selectGroup(index)}}>
				{index+1}
			</Tab>
		{/each}
		<svelte:fragment slot='controls'>
			<Button tertiary small on:click={addGroup} title={format('addGroup')}>
				<Icon icon='add'></Icon>
			</Button>
		</svelte:fragment>
	</TabBar>
	<ItemBar alt round='top'>
		<Button tertiary on:click={()=>{duplicateGroup(selectedIndex)}} title={format('duplicateGroup')}>
			<Icon icon='duplicate'></Icon>
		</Button>
		<Button dangerous on:click={()=>{removeGroup(selectedIndex)}} title={format('deleteGroup')}>
			<Icon icon='delete'></Icon>
		</Button>
	</ItemBar>
	<Section alt round='bottom' padded>
		{#if !currentGroup}
			{format('selectAGroup')}
		{:else}
			<label>
				<select bind:value={currentGroup.sourceType}>
					<option value='emoji'>{format('group.emojiType')}</option>
					<option value='asset'>{format('group.assetType')}</option>
				</select>
				{format('group.type')}
			</label>
			{#if currentGroup.sourceType === 'emoji'}
				<label>
					<input type='text' bind:value={currentGroup.emoji}/>
					{format('group.emojiType')}
				</label>
			{:else if currentGroup.sourceType === 'asset'}
				<label>
					<input type='hidden'/>
					{format('group.assetType')}
					<Button title={format('openAsset')} tertiary on:click={()=>{openFileDialog(selectedIndex)}}>
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
						{format('unsupportedAsset')}
					{/if}
				</div>
			{/if}
			<label>
				<input type='number' bind:value={currentGroup.size}/>
				<span>{format('group.baseSize')}</span>
			</label>
			<hr/>
			<Info tertiary>
				{format('group.reloadRequired')}
			</Info>
			<label>
				<input type='number' bind:value={currentGroup.count}/>
				<span>{format('group.count')}</span>
			</label>
			<Info tertiary>
				{format('positionDimensionInformation')}
			</Info>
			<label>
				<input type='number' bind:value={currentGroup.spawnX}/>
				<span>{format('group.spawnX')}</span>
			</label>
			<label>
				<input type='number' bind:value={currentGroup.spawnY}/>
				<span>{format('group.spawnY')}</span>
			</label>
			<label>
				<input type='number' bind:value={currentGroup.minScale}/>
				<span>{format('group.minScale')}</span>
			</label>
			<label>
				<input type='number' bind:value={currentGroup.scaleRandom}/>
				<span>{format('group.randomScale')}</span>
			</label>
			<label>
				<input type='checkbox' bind:checked={currentGroup.rotate}/>
				<span>{format('group.randomizeStartingRotation')}</span>
			</label>
			<Info tertiary>
				{format('group.randomizationInformation')}
			</Info>
			<label>
				<input type='number' bind:value={currentGroup.xRandomRate[0]}/>
				<input type='number' bind:value={currentGroup.xRandomRate[1]}/>
				<span>{format('group.randomXRate')}</span>
			</label>
			<label>
				<input type='number' bind:value={currentGroup.yRandomRate[0]}/>
				<input type='number' bind:value={currentGroup.yRandomRate[1]}/>
				<span>{format('group.randomYRate')}</span>
			</label>
			<label>
				<input type='number' bind:value={currentGroup.rotRandomRate[0]}/>
				<input type='number' bind:value={currentGroup.rotRandomRate[1]}/>
				<span>{format('group.randomRotationRate')}</span>
			</label>
		{/if}
	</Section>
</main>

<style>
	main {
		display: grid;
		grid-template-rows: auto auto auto minmax(0, 1fr);
		overflow: auto;
		height: 100%;
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