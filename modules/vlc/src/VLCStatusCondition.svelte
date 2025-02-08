<script lang='ts'>
	import type { Format } from '@kettek/litch-app/src/interfaces/Format'
	import ItemGroup from '@kettek/litch-app/src/components/ItemGroup.svelte'
	
	interface ConditionI {
		address?: string
		password?: string
		interval?: number
	}

	export let format: Format
	export let condition: ConditionI
	export let refresh: () => void

</script>

<main>
	<ItemGroup label>
		<input type='text' placeholder='http://localhost:8080' bind:value={condition.address} on:change={refresh}/>
		<svelte:fragment slot='label'>
			{format('address')}
		</svelte:fragment>
	</ItemGroup>
	<ItemGroup label>
		<input type='password' bind:value={condition.password} on:change={refresh}/>
		<svelte:fragment slot='label'>
			{format('password')}
		</svelte:fragment>
	</ItemGroup>
	<ItemGroup label>
		<input type='number' placeholder='5000' bind:value={condition.interval} on:change={refresh}/>
		<svelte:fragment slot='label'>
			{format('interval')}
		</svelte:fragment>
	</ItemGroup>
</main>

<style>
</style>