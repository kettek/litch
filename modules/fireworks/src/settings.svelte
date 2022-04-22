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
	import { defaultGroup, defaultPayload, SettingsInterface } from './SettingsI'

	export let format: Format

	export let settings: SettingsInterface

	//export let update: (v: any) => void

	export let assets: AssetManager

	let selectedIndex: number = 0
	$: currentGroup = settings.groups[selectedIndex]

	async function selectRocket(index: number) {
		let results = await assets.open({
			multiple: false,
		})
		if (results.length === 0) return
		settings.groups[index].rocket.reference = results[0] as AssetResult
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
	/* Payloads */
	let selectedPayloadIndex: number = 0
	$: currentPayload = settings.groups[selectedIndex]?.payload[selectedPayloadIndex]
	function addPayload() {
		if (!currentGroup) return
		currentGroup.payload.push(JSON.parse(JSON.stringify(defaultPayload)))
		settings = settings
	}
	function removePayload(index: number) {
		if (!currentGroup) return
		currentGroup.payload = currentGroup.payload.filter((_, i) => i !== index)
		settings = settings
	}
	function selectPayload(index: number) {
		if (!currentGroup) return
		selectedPayloadIndex = index
	}
	function duplicatePayload(index: number) {
		if (!currentGroup) return
		let newPayload = JSON.parse(JSON.stringify(currentGroup.payload[index]))
		currentGroup.payload.splice(index, 0, newPayload)
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
				<select bind:value={currentGroup.rocket.sourceType}>
					<option value='emoji'>{format('group.emojiType')}</option>
					<option value='asset'>{format('group.assetType')}</option>
					<option value='particle'>{format('group.particleType')}</option>
				</select>
				<svelte:fragment slot='label'>
					{format('group.type')}
				</svelte:fragment>
			</ItemGroup>
			{#if currentGroup.rocket.sourceType === 'emoji'}
				<ItemGroup label>
					<input type='text' bind:value={currentGroup.rocket.emoji}/>
					<svelte:fragment slot='label'>
						{format('group.emojiType')}
				</svelte:fragment>
				</ItemGroup>
			{:else if currentGroup.rocket.sourceType === 'asset'}
				<ItemGroup>
					<div class='preview'>
						<AssetViewer asset={assets.get(currentGroup.rocket.reference)} displayed contained bg/>
					</div>
					<Button title={format('openAsset')} tertiary on:click={()=>{selectRocket(selectedIndex)}}>
						<Icon icon='open'></Icon>
					</Button>
				</ItemGroup>
			{/if}
			<ItemGroup label>
				<input type='number' bind:value={currentGroup.rocket.size}/>
				<svelte:fragment slot='label'>
					{format('group.baseSize')}
				</svelte:fragment>
			</ItemGroup>
			<ItemGroup label>
				<input type='number' bind:value={currentGroup.rocket.force}/>
				<svelte:fragment slot='label'>
					speed
				</svelte:fragment>
			</ItemGroup>
			<ItemGroup count={3} maxedCount={2} label>
				<input type='number' bind:value={currentGroup.launchRateMin}/>
				<input type='number' bind:value={currentGroup.launchRateMax}/>
				<svelte:fragment slot='label'>
					launch rate min/max
				</svelte:fragment>
			</ItemGroup>
			<ItemGroup count={3} maxedCount={2} label>
				<input type='number' bind:value={currentGroup.explosionDelayMin}/>
				<input type='number' bind:value={currentGroup.explosionDelayMax}/>
				<svelte:fragment slot='label'>
					explosion delay min/max
				</svelte:fragment>
			</ItemGroup>
			<hr/>
			<Info tertiary>
				{format('group.reloadRequired')}
			</Info>
			<ItemGroup label>
				<input type='number' bind:value={currentGroup.count}/>
				<svelte:fragment slot='label'>
					payload launch
				</svelte:fragment>
			</ItemGroup>
			<TabBar>
				{#each currentGroup.payload as payload, payloadIndex}
					<Tab alt tertiary selected={payloadIndex===selectedPayloadIndex} on:click={()=>{selectPayload(payloadIndex)}}>
						{payloadIndex+1}
					</Tab>
				{/each}
				<svelte:fragment slot='controls'>
					<Button tertiary small on:click={addPayload} title={format('addPayload')}>
						<Icon icon='add'></Icon>
					</Button>
				</svelte:fragment>
			</TabBar>
			<ItemBar round='top'>
				<Button tertiary on:click={()=>{duplicatePayload(selectedPayloadIndex)}} title='Duplicate payload'>
					<Icon icon='duplicate'></Icon>
				</Button>
				<Button dangerous on:click={()=>{removePayload(selectedPayloadIndex)}} title='Remove payload'>
					<Icon icon='delete'></Icon>
				</Button>
			</ItemBar>
			<Section round='bottom' padded>
				{#if !currentPayload}
					Select a payload
				{:else}
					<ItemGroup label>
						<select bind:value={currentPayload.sourceType}>
							<option value='emoji'>{format('group.emojiType')}</option>
							<option value='asset'>{format('group.assetType')}</option>
							<option value='particle'>{format('group.particleType')}</option>
						</select>
						<svelte:fragment slot='label'>
							{format('group.type')}
						</svelte:fragment>
					</ItemGroup>
					{#if currentPayload.sourceType === 'emoji'}
						<ItemGroup label>
							<input type='text' bind:value={currentPayload.emoji}/>
							<svelte:fragment slot='label'>
								{format('group.emojiType')}
						</svelte:fragment>
						</ItemGroup>
					{:else if currentPayload.sourceType === 'asset'}
						<ItemGroup>
							<div class='preview'>
								<AssetViewer asset={assets.get(currentPayload.reference)} displayed contained bg/>
							</div>
							<Button title={format('openAsset')} tertiary on:click={()=>{selectRocket(selectedIndex)}}>
								<Icon icon='open'></Icon>
							</Button>
						</ItemGroup>
					{/if}
					<ItemGroup label>
						<input type='number' bind:value={currentPayload.size}/>
						<svelte:fragment slot='label'>
							{format('group.baseSize')}
						</svelte:fragment>
					</ItemGroup>
					<ItemGroup label>
						<input type='color' bind:value={currentPayload.color}/>
						<svelte:fragment slot='label'>
							Color
						</svelte:fragment>
					</ItemGroup>
					<ItemGroup label>
						<input type='number' bind:value={currentPayload.force}/>
						<svelte:fragment slot='label'>
							Force
						</svelte:fragment>
					</ItemGroup>
					<ItemGroup count={3} maxedCount={2} label>
						<input type='number' bind:value={currentPayload.weightMin}/>
						<input type='number' bind:value={currentPayload.weightMax}/>
						<svelte:fragment slot='label'>
							weight min/max
						</svelte:fragment>
					</ItemGroup>
				{/if}
			</Section>
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