<script lang='ts'>
	import type { Format } from '@kettek/litch-app/src/interfaces/Format'
  import ItemGroup from '@kettek/litch-app/src/components/ItemGroup.svelte'
	import type { AssetManager, AssetResult } from '@kettek/litch-app/src/interfaces/Asset'
  import Info from '@kettek/litch-app/src/components/Info.svelte'
  import type { SettingsInterface } from './SettingsI'
	import Button from '@kettek/litch-app/src/components/Button.svelte'
	import Icon from '@kettek/litch-app/src/components/Icon.svelte'
	
	interface Data {
		targetCollection: string
		targetTitle: string
		targetTitleColor: string
		uniqueID: string
		targetAsset: string
	}

	export let format: Format
	export let settings: SettingsInterface
	export let data: Data
	export let assets: AssetManager
	export let refresh: () => void

	async function openCollectionDialog() {
		let results = await assets.open({
			multiple: true,
			collectionsOnly: true,
		})
		if (!results || results.length === 0) return
		data.targetCollection = results[0].collection
		refresh()
	}
</script>

<main draggable='true' on:dragstart|preventDefault|stopPropagation>
	<ItemGroup count={2} label>
		<input type='text' bind:value={data.targetTitle} on:change={refresh}/>
		<svelte:fragment slot='label'>{format('addAction.title')}</svelte:fragment>
	</ItemGroup>
	<Info tertiary>
		{format('addAction.titleInfo')}
	</Info>
	<ItemGroup count={2} label>
		<input type='text' bind:value={data.targetTitleColor} on:change={refresh}/>
		<svelte:fragment slot='label'>{format('addAction.titleColor')}</svelte:fragment>
	</ItemGroup>
	<Info tertiary>
		{format('addAction.titleColorInfo')}
	</Info>
	<ItemGroup count={2} label>
		<input type='text' bind:value={data.uniqueID} on:change={refresh}/>
		<svelte:fragment slot='label'>{format('addAction.uniqueID')}</svelte:fragment>
	</ItemGroup>
	<Info tertiary>
		{format('addAction.uniqueIDInfo')}
	</Info>
	<ItemGroup count={3} label>
		{assets.collectionName(data.targetCollection)}
		<Button title={format('openAsset')} tertiary on:click={openCollectionDialog}>
			<Icon icon='open'></Icon>
		</Button>
		<svelte:fragment slot='label'>{format('addAction.collection')}</svelte:fragment>
	</ItemGroup>
	<ItemGroup count={2} label>
		<input type='text' bind:value={data.targetAsset} on:change={refresh}/>
		<svelte:fragment slot='label'>{format('addAction.asset')}</svelte:fragment>
	</ItemGroup>
	<Info tertiary>
		{format('addAction.assetInfo')}
	</Info>
</main>

<style>
</style>