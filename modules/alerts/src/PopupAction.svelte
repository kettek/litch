<script lang='ts'>
	import type { Format } from '@kettek/litch-app/src/interfaces/Format'
  import ItemGroup from '@kettek/litch-app/src/components/ItemGroup.svelte'
	
	interface TriggerI {
		message: string
	}

	export let format: Format
	export let trigger: TriggerI
	export let refresh: () => void

</script>

<main>
	<ItemGroup label>
		<input bind:value={trigger.message} on:change={refresh}/>
		<svelte:fragment slot='label'>
			{format('popup.message')}
		</svelte:fragment>
	</ItemGroup>
</main>

<style>
</style>