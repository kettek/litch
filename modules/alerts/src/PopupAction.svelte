<script lang='ts'>
	import type { Format } from '@kettek/litch-app/src/interfaces/Format'
  import ItemGroup from '@kettek/litch-app/src/components/ItemGroup.svelte'
  import type { PopupTriggerDataI } from './interfaces'
	
	export let format: Format
	export let data: PopupTriggerDataI
	export let refresh: () => void

</script>

<main>
	<ItemGroup label>
		<input bind:value={data.message} on:change={refresh}/>
		<svelte:fragment slot='label'>
			{format('popup.message')}
		</svelte:fragment>
	</ItemGroup>
</main>

<style>
</style>