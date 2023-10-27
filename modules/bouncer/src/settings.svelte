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
	import { defaultBouncer, SettingsInterface } from './SettingsI'
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
	$: currentBouncer = settings.bouncers[selectedIndex]

	async function openFileDialog(index: number) {
		let results = await assets.open({
			multiple: false,
		})
		if (results.length === 0) return
		settings.bouncers[index].reference = results[0] as AssetResult
	}

	function addBouncer() {
		settings.bouncers.push(JSON.parse(JSON.stringify(defaultBouncer)))
		settings = settings
	}
	function removeBouncer(index: number) {
		settings.bouncers = settings.bouncers.filter((_, i) => i !== index)
		settings = settings
	}
	function selectBouncer(index: number) {
		selectedIndex = index
	}
	function duplicateBouncer(index: number) {
		let newBouncer = JSON.parse(JSON.stringify(settings.bouncers[index]))
		settings.bouncers.splice(index, 0, newBouncer)
		settings = settings
	}
	function clearTemporaries() {
		settings.bouncers = settings.bouncers.filter(bouncer => !bouncer.temporary)
		settings = settings
		update(settings)
	}
</script>

<main>
	<ItemBar alt round='top'>
		<Button tertiary on:click={clearTemporaries} title={format('clearTemporaries')}>
			<Icon icon='delete'></Icon>
		</Button>
	</ItemBar>
	<Section alt rounded padded>
		<ItemGroup label>
			<input type='number' bind:value={settings.bouncerSpeed}/>
			<svelte:fragment slot='label'>
				{format('bouncerSpeed')}
			</svelte:fragment>
		</ItemGroup>
		<ItemGroup label>
			<input type='checkbox' bind:checked={settings.bouncerCircular}/>
			<svelte:fragment slot='label'>
				{format('bouncerCircular')}
			</svelte:fragment>
		</ItemGroup>
		<ItemGroup label>
			<input disabled={!settings.bouncerCircular} type='checkbox' bind:checked={settings.bouncerUseHeight}/>
			<svelte:fragment slot='label'>
				{format('bouncerUseHeight')}
			</svelte:fragment>
		</ItemGroup>
		<ItemGroup label>
			<input type='number' bind:value={settings.minBouncerWidth}/>
			<svelte:fragment slot='label'>
				{format('minBouncerWidth')}
			</svelte:fragment>
		</ItemGroup>
		<ItemGroup label>
			<input type='number' bind:value={settings.minBouncerHeight}/>
			<svelte:fragment slot='label'>
				{format('minBouncerHeight')}
			</svelte:fragment>
		</ItemGroup>
		<ItemGroup label>
			<input type='number' bind:value={settings.maxBouncerWidth}/>
			<svelte:fragment slot='label'>
				{format('maxBouncerWidth')}
			</svelte:fragment>
		</ItemGroup>
		<ItemGroup label>
			<input type='number' bind:value={settings.maxBouncerHeight}/>
			<svelte:fragment slot='label'>
				{format('maxBouncerHeight')}
			</svelte:fragment>
		</ItemGroup>
	</Section>
	<TabBar>
		{#each settings.bouncers as bouncer, index}
			<Tab tertiary selected={index===selectedIndex} on:click={()=>{selectBouncer(index)}}>
				{index+1}
			</Tab>
		{/each}
		<svelte:fragment slot='controls'>
			<Button tertiary small on:click={addBouncer} title={format('addBouncer')}>
				<Icon icon='add'></Icon>
			</Button>
		</svelte:fragment>
	</TabBar>
	<ItemBar alt round='top'>
		{#if currentBouncer}
			<Button tertiary on:click={()=>{duplicateBouncer(selectedIndex)}} title={format('duplicateBouncer')}>
				<Icon icon='duplicate'></Icon>
			</Button>
			<Button dangerous on:click={()=>{removeBouncer(selectedIndex)}} title={format('deleteBouncer')}>
				<Icon icon='delete'></Icon>
			</Button>
		{/if}
	</ItemBar>
	<Section alt round='bottom' padded>
		{#if currentBouncer}
			<ItemGroup>
				<div class='preview'>
					<AssetViewer asset={assets.get(currentBouncer.reference)} displayed contained bg/>
				</div>
				<Button title={format('openAsset')} tertiary on:click={()=>{openFileDialog(selectedIndex)}}>
					<Icon icon='open'></Icon>
				</Button>
			</ItemGroup>
			<ItemGroup label>
				<input type='text' bind:value={currentBouncer.title}/>
				<svelte:fragment slot='label'>
					{format('title')}
				</svelte:fragment>
			</ItemGroup>
			<ItemGroup label>
				<input type='color' bind:value={currentBouncer.titleColor}/>
				<svelte:fragment slot='label'>
					{format('titleColor')}
				</svelte:fragment>
			</ItemGroup>
			<ItemGroup label>
				<input type='text' bind:value={currentBouncer.id}/>
				<svelte:fragment slot='label'>
					{format('id')}
				</svelte:fragment>
			</ItemGroup>
			<ItemGroup label>
				<input type='checkbox' bind:checked={currentBouncer.temporary}/>
				<svelte:fragment slot='label'>
					{format('temporary')}
				</svelte:fragment>
			</ItemGroup>
		{:else}
			{format('selectABouncer')}
		{/if}
	</Section>
</main>

<style>
	main {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr) auto auto minmax(0, 1fr);
		overflow: auto;
		height: 100%;
	}
	input[type=number] {
		width: 5em;
	}
	input[type=text] {
		width: 12em;
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