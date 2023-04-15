<script lang='ts'>
	import type { Format } from '@kettek/litch-app/src/interfaces/Format'
  import ItemGroup from '@kettek/litch-app/src/components/ItemGroup.svelte'
	
	interface ConditionI {
		cancel: boolean
	}

	export let format: Format
	export let condition: ConditionI
	export let refresh: () => void

</script>

<main>
	<ItemGroup label>
		<input type='checkbox' bind:value={condition.cancel} on:change={refresh}/>
		<svelte:fragment slot='label'>
			{format('raidCancel')}
		</svelte:fragment>
	</ItemGroup>
</main>

<style>
</style>