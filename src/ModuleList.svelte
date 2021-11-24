<script type="ts">
	import type { ModuleInterface } from './interfaces/Module'
	import Button from './components/Button.svelte'
	import { createEventDispatcher } from 'svelte'
	export let modules: Record<string, ModuleInterface> = {}

	const dispatch = createEventDispatcher<string>()
</script>

<main class:tertiary={true}>
	{#each Object.entries(modules) as [uuid, module]}
		<li title={uuid}>
			<span>{module.title}</span>
			<Button tertiary on:click={()=>dispatch('add', uuid)}>+</Button>
		</li>
	{/each}
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		color: var(--tertiary);
		background: var(--bar-bg);
		margin: 0 .75em 1em .7em;
		padding: 1em;
		border-radius: 0 0 1em 1em;
	}
	li {
		list-style: none;
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		grid-template-rows: minmax(0, 1fr);
	}
	span {
		display: flex;
		align-items: center;
		padding: .5em;
	}
</style>