<script type="ts">
	import type { ModuleInterface } from './interfaces/Module'
	import { createEventDispatcher } from 'svelte'
	export let modules: Record<string, ModuleInterface> = {}

	const dispatch = createEventDispatcher<string>()
</script>

<main>
	{#each Object.entries(modules) as [uuid, module]}
		<li title={uuid}>
			<span>{module.title}</span>
			<button on:click={()=>dispatch('add', uuid)}>+</button>
		</li>
	{/each}
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
	}
	li {
		list-style: none;
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		grid-template-rows: minmax(0, 1fr);
	}
</style>