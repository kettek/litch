<script type='ts'>
	import type { Format } from '@kettek/litch-app/src/interfaces/Format'
  import type { ServiceChannel } from '@kettek/litch-app/src/interfaces/Service'
  import type { ServiceData } from './interfaces'
	
	interface ConditionI {
		id: string
	}

	export let id: string
	export let data: ServiceData
	export let channel: ServiceChannel
	export let format: Format
	export let condition: ConditionI
	export let refresh: () => void

	function changeCondition(id: string) {
		condition.id = id
		refresh()
	}
	
</script>

<main>
	{#if data.redeems.length == 0}
		<aside>No redeems found</aside>
	{/if}
	<select value={condition.id} on:change={(e)=>changeCondition(e.currentTarget.value)}>
		{#each data.redeems as redeem}
			<option value={redeem.id}>{redeem.title} ({redeem.cost})</option>
		{/each}
	</select>
</main>

<style>
</style>