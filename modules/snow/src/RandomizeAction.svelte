<script lang='ts'>
	import type { Format } from '@kettek/litch-app/src/interfaces/Format'
  import ItemGroup from '@kettek/litch-app/src/components/ItemGroup.svelte'
	import type { AssetManager, AssetResult } from '@kettek/litch-app/src/interfaces/Asset'
  import Info from '@kettek/litch-app/src/components/Info.svelte'
  import type { SettingsInterface } from './SettingsI'
	import Button from '@kettek/litch-app/src/components/Button.svelte'
	import Icon from '@kettek/litch-app/src/components/Icon.svelte'
	
	interface RandomizeData {
		groupIndex: number
		sourceType: 'emoji' | 'asset'
		targetEmojis: string[]
		targetCollection: string
	}

	export let format: Format
	export let settings: SettingsInterface
	export let data: RandomizeData
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
	
	function selectItem(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) {
		data.groupIndex = Number(e.currentTarget.value)
		refresh()
	}
</script>

<main draggable='true' on:dragstart|preventDefault|stopPropagation>
	<ItemGroup label noAlt>
		<select on:change={selectItem}>
			{#if data.groupIndex === undefined}
				<option></option>
			{/if}
			{#each settings.groups as group, index}
				<option value={index}>{index}</option>
			{/each}
		</select>
		<svelte:fragment slot='label'>{format('randomizeAction.groupIndex')}</svelte:fragment>
	</ItemGroup>
	{#if settings.groups[data.groupIndex]}
		{#if settings.groups[data.groupIndex].sourceType === 'emoji'}
			TODO: modify emoji
		{:else if settings.groups[data.groupIndex].sourceType === 'asset'}
			<ItemGroup count={3} label>
				{assets.collectionName(data.targetCollection)}
				<Button title={format('openAsset')} tertiary on:click={openCollectionDialog}>
					<Icon icon='open'></Icon>
				</Button>
				<svelte:fragment slot='label'>{format('randomizeAction.collection')}</svelte:fragment>
			</ItemGroup>
		{/if}
	{/if}
</main>

<style>
</style>