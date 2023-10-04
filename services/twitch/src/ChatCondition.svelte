<script lang='ts'>
	import type { Format } from '@kettek/litch-app/src/interfaces/Format'
  import ItemGroup from '@kettek/litch-app/src/components/ItemGroup.svelte'
	
	interface ConditionI {
		userRegex: string
		messageRegex: string
	}

	export let format: Format
	export let condition: ConditionI
	export let refresh: () => void

</script>

<main>
	<ItemGroup label>
		<input type='text' bind:value={condition.userRegex} on:change={refresh}/>
		<svelte:fragment slot='label'>
			{format('userRegex')}
		</svelte:fragment>
	</ItemGroup>
	<ItemGroup label>
		<input type='text' bind:value={condition.messageRegex} on:change={refresh}/>
		<svelte:fragment slot='label'>
			{format('messageRegex')}
		</svelte:fragment>
	</ItemGroup>
</main>

<style>
</style>