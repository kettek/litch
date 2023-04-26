<script lang='ts'>
	import type { Format } from '@kettek/litch-app/src/interfaces/Format'
  import ItemGroup from '@kettek/litch-app/src/components/ItemGroup.svelte'
  import type { MutedTriggerDataI } from './triggers'

	export let format: Format
	export let data: MutedTriggerDataI
	export let refresh: () => void
</script>

<main draggable="true" on:dragstart|preventDefault|stopPropagation>
	<ItemGroup label noAlt>
		<input type='checkbox' bind:checked={data.mute} on:change={refresh}/>
		<svelte:fragment slot='label'>
			{format('mute')}
		</svelte:fragment>
	</ItemGroup>
</main>