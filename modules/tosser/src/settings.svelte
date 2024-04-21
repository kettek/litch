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
	import type { ModuleChannel } from '@kettek/litch-app/src/interfaces/ModuleInstance'
	import type { Format } from '@kettek/litch-app/src/interfaces/Format'
	import { defaultItem, SettingsInterface } from './SettingsI'
	import { upgrade } from './upgrade'

	export let format: Format

	export let settings: SettingsInterface

	export let update: (v: any) => void

	let [changed, settings_] = upgrade(settings)
	if (changed) {
		update(settings_)
	}

	export let assets: AssetManager

	let selectedIndex: number = 0
	$: currentItem = settings.items[selectedIndex]

	async function openFileDialog(index: number) {
		let results = await assets.open({
			multiple: false,
		})
		if (results.length === 0) return
		settings.items[index].reference = results[0] as AssetResult
	}

	function addItem() {
		settings.items.push(JSON.parse(JSON.stringify(defaultItem)))
		settings = settings
	}
	function removeItem(index: number) {
		settings.items = settings.items.filter((_, i) => i !== index)
		settings = settings
	}
	function selectItem(index: number) {
		selectedIndex = index
	}
	function duplicateItem(index: number) {
		let newItem = JSON.parse(JSON.stringify(settings.items[index]))
		settings.items.splice(index, 0, newItem)
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
		<ItemGroup label maxedCount={2} count={3}>
			<input type='number' bind:value={settings.gravity[0]}/>
			<input type='number' bind:value={settings.gravity[1]}/>
			<svelte:fragment slot='label'>{format('gravity')}</svelte:fragment>
		</ItemGroup>
		<ItemGroup label maxedCount={2} count={3}>
			<input type='number' bind:value={settings.spawnRangeX[0]}/>
			<input type='number' bind:value={settings.spawnRangeX[1]}/>
			<svelte:fragment slot='label'>{format('spawnRangeX')}</svelte:fragment>
		</ItemGroup>
		<ItemGroup label maxedCount={2} count={3}>
			<input type='number' bind:value={settings.spawnRangeY[0]}/>
			<input type='number' bind:value={settings.spawnRangeY[1]}/>
			<svelte:fragment slot='label'>{format('spawnRangeY')}</svelte:fragment>
		</ItemGroup>
		<ItemGroup label maxedCount={2} count={3}>
			<input type='number' bind:value={settings.spawnVelocity[0]}/>
			<input type='number' bind:value={settings.spawnVelocity[1]}/>
			<svelte:fragment slot='label'>{format('spawnVelocity')}</svelte:fragment>
		</ItemGroup>
		<ItemGroup label maxedCount={2} count={3}>
			<input type='number' bind:value={settings.spawnAngle[0]}/>
			<input type='number' bind:value={settings.spawnAngle[1]}/>
			<svelte:fragment slot='label'>{format('spawnAngle')}</svelte:fragment>
		</ItemGroup>
		<ItemGroup label maxedCount={2} count={3}>
			<input type='number' bind:value={settings.lifetime[0]}/>
			<input type='number' bind:value={settings.lifetime[1]}/>
			<svelte:fragment slot='label'>{format('lifetime')}</svelte:fragment>
		</ItemGroup>
	</Section>
	<TabBar>
		{#each settings.items as group, index}
			<Tab tertiary selected={index===selectedIndex} on:click={()=>{selectItem(index)}}>
				{index+1}
			</Tab>
		{/each}
		<svelte:fragment slot='controls'>
			<Button tertiary small on:click={addItem} title={format('addItem')}>
				<Icon icon='add'></Icon>
			</Button>
		</svelte:fragment>
	</TabBar>
	<ItemBar alt round='top'>
		<Button tertiary on:click={()=>{duplicateItem(selectedIndex)}} title={format('duplicateItem')}>
			<Icon icon='duplicate'></Icon>
		</Button>
		<Button dangerous on:click={()=>{removeItem(selectedIndex)}} title={format('deleteItem')}>
			<Icon icon='delete'></Icon>
		</Button>
	</ItemBar>
	<Section alt round='bottom' padded>
		{#if !currentItem}
			{format('selectAnItem')}
		{:else}
			<ItemGroup label>
				<input type='number' bind:value={currentItem.scale[0]}/>
				<input type='number' bind:value={currentItem.scale[1]}/>
				<svelte:fragment slot='label'>
					{format('item.scale')}
				</svelte:fragment>
			</ItemGroup>
			<ItemGroup label>
				<select bind:value={currentItem.sourceType}>
					<option value='emoji'>{format('item.emojiType')}</option>
					<option value='asset'>{format('item.assetType')}</option>
				</select>
				<svelte:fragment slot='label'>
					{format('item.type')}
				</svelte:fragment>
			</ItemGroup>
			{#if currentItem.sourceType === 'emoji'}
				<ItemGroup label>
					<input type='text' bind:value={currentItem.emoji}/>
					<svelte:fragment slot='label'>
						{format('item.emojiType')}
				</svelte:fragment>
				</ItemGroup>
			{:else if currentItem.sourceType === 'asset'}
				<ItemGroup>
					<div class='preview'>
						<AssetViewer asset={assets.get(currentItem.reference)} displayed contained bg/>
					</div>
					<Button title={format('openAsset')} tertiary on:click={()=>{openFileDialog(selectedIndex)}}>
						<Icon icon='open'></Icon>
					</Button>
				</ItemGroup>
			{/if}
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