<script lang='ts'>
	import type { Format } from '@kettek/litch-app/src/interfaces/Format'
  import ItemGroup from '@kettek/litch-app/src/components/ItemGroup.svelte'
	import type { AssetManager, AssetResult } from '@kettek/litch-app/src/interfaces/Asset'
  import Info from '@kettek/litch-app/src/components/Info.svelte'
  import type { SettingsInterface } from './SettingsI'
	import Button from '@kettek/litch-app/src/components/Button.svelte'
	import Icon from '@kettek/litch-app/src/components/Icon.svelte'
	
	interface Data {
		itemIndex: number
		randomizeItemIndex: boolean
	}

	export let format: Format
	export let settings: SettingsInterface
	export let data: Data
	export let assets: AssetManager
	export let refresh: () => void

	function selectItem(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) {
		data.itemIndex = Number(e.currentTarget.value)
		refresh()
	}
	function toggleRandomizeItemIndex(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		data.randomizeItemIndex = e.currentTarget.checked
		refresh()
	}
</script>

<main draggable='true' on:dragstart|preventDefault|stopPropagation>
	<ItemGroup count={2} label>
		<input type='checkbox' checked={data.randomizeItemIndex} on:change={toggleRandomizeItemIndex}/>
		<svelte:fragment slot='label'>{format('tossAction.randomizeItemIndex')}</svelte:fragment>
	</ItemGroup>
	{#if !data.randomizeItemIndex}
		<ItemGroup label noAlt>
			<select on:change={selectItem}>
				{#if data.itemIndex === undefined}
					<option></option>
				{/if}
				{#each settings.items as item, index}
					<option value={index}>{index}</option>
				{/each}
			</select>
			<svelte:fragment slot='label'>{format('tossAction.itemIndex')}</svelte:fragment>
		</ItemGroup>
	{/if}
</main>

<style>
</style>