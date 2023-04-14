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
	
</script>

<main>
	<select>
		{#each data.redeems as redeem}
			<option value={redeem.id}>{redeem.title} ({redeem.cost})</option>
		{/each}
	</select>
</main>

<style>
</style>