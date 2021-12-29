<script type="ts">
	import Info from '@kettek/litch-app/src/components/Info.svelte'
	import Icon from '@kettek/litch-app/src/components/Icon.svelte'
	import ItemBar from '@kettek/litch-app/src/components/ItemBar.svelte'
	import ItemGroup from '@kettek/litch-app/src/components/ItemGroup.svelte'
	import Button from '@kettek/litch-app/src/components/Button.svelte'
	import Tab from '@kettek/litch-app/src/components/Tab.svelte'
	import TabBar from '@kettek/litch-app/src/components/TabBar.svelte'
	import Section from '@kettek/litch-app/src/components/Section.svelte'
	import type { AssetManager, AssetResult } from '@kettek/litch-app/src/interfaces/Asset'
	import AssetViewer from '@kettek/litch-app/src/components/AssetViewer.svelte'
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
		<ItemGroup label>
			<input type='number' bind:value={settings.updateRate}/>
			<svelte:fragment slot='label'>
				{format('updateRate')}
			</svelte:fragment>
		</ItemGroup>
		<ItemGroup label>
			<input type='number' bind:value={settings.maxAccumulator}/>
			<svelte:fragment slot='label'>
				{format('maxAccumulator')}
			</svelte:fragment>
		</ItemGroup>
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
			<ItemGroup label>
				<select bind:value={currentGroup.sourceType}>
					<option value='emoji'>{format('group.emojiType')}</option>
					<option value='asset'>{format('group.assetType')}</option>
				</select>
				<svelte:fragment slot='label'>
					{format('group.type')}
				</svelte:fragment>
			</ItemGroup>
			{#if currentGroup.sourceType === 'emoji'}
				<ItemGroup label>
					<input type='text' bind:value={currentGroup.emoji}/>
					<svelte:fragment slot='label'>
						{format('group.emojiType')}
				</svelte:fragment>
				</ItemGroup>
			{:else if currentGroup.sourceType === 'asset'}
				<ItemGroup>
					<div class='preview'>
						<AssetViewer asset={assets.get(currentGroup.reference)} displayed contained bg/>
					</div>
					<Button title={format('openAsset')} tertiary on:click={()=>{openFileDialog(selectedIndex)}}>
						<Icon icon='open'></Icon>
					</Button>
				</ItemGroup>
			{/if}
			<ItemGroup label>
				<input type='number' bind:value={currentGroup.size}/>
				<svelte:fragment slot='label'>
					{format('group.baseSize')}
				</svelte:fragment>
			</ItemGroup>
			<hr/>
			<Info tertiary>
				{format('group.reloadRequired')}
			</Info>
			<ItemGroup label>
				<input type='number' bind:value={currentGroup.count}/>
				<svelte:fragment slot='label'>
					{format('group.count')}
				</svelte:fragment>
			</ItemGroup>
			<Info tertiary>
				{format('positionDimensionInformation')}
			</Info>
			<ItemGroup label>
				<input type='number' bind:value={currentGroup.spawnX}/>
				<svelte:fragment slot='label'>
					{format('group.spawnX')}
				</svelte:fragment>
			</ItemGroup>
			<ItemGroup label>
				<input type='number' bind:value={currentGroup.spawnY}/>
				<svelte:fragment slot='label'>
					{format('group.spawnY')}
				</svelte:fragment>
			</ItemGroup>
			<ItemGroup label>
				<input type='number' bind:value={currentGroup.minScale}/>
				<svelte:fragment slot='label'>
					{format('group.minScale')}
				</svelte:fragment>
			</ItemGroup>
			<ItemGroup label>
				<input type='number' bind:value={currentGroup.scaleRandom}/>
				<svelte:fragment slot='label'>
					{format('group.randomScale')}
				</svelte:fragment>
			</ItemGroup>
			<ItemGroup label>
				<input type='checkbox' bind:checked={currentGroup.rotate}/>
				<svelte:fragment slot='label'>
					{format('group.randomizeStartingRotation')}
				</svelte:fragment>
			</ItemGroup>
			<Info tertiary>
				{format('group.randomizationInformation')}
			</Info>
			<ItemGroup label maxedCount={2} count={3}>
				<input type='number' bind:value={currentGroup.xRandomRate[0]}/>
				<input type='number' bind:value={currentGroup.xRandomRate[1]}/>
				<svelte:fragment slot='label'>{format('group.randomXRate')}</svelte:fragment>
			</ItemGroup>
			<ItemGroup label maxedCount={2} count={3}>
				<input type='number' bind:value={currentGroup.yRandomRate[0]}/>
				<input type='number' bind:value={currentGroup.yRandomRate[1]}/>
				<svelte:fragment slot='label'>
					{format('group.randomYRate')}
				</svelte:fragment>
			</ItemGroup>
			<ItemGroup label maxedCount={2} count={3}>
				<input type='number' bind:value={currentGroup.rotRandomRate[0]}/>
				<input type='number' bind:value={currentGroup.rotRandomRate[1]}/>
				<svelte:fragment slot='label'>
					{format('group.randomRotationRate')}
				</svelte:fragment>
			</ItemGroup>
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
	.preview {
		max-height: 8em;
		max-width: 8em;
	}
	hr {
		width: 100%;
		border-color: var(--text);
	}
</style>