<script type="ts">
	import { _ } from 'svelte-i18n'
	import type { ModuleInterface } from './interfaces/Module'
	import Button from './components/Button.svelte'
	import Icon from './components/Icon.svelte'
	import { createEventDispatcher } from 'svelte'
	export let modules: Record<string, ModuleInterface> = {}

	const dispatch = createEventDispatcher<string>()
</script>

<main class:tertiary={true}>
	{#each Object.entries(modules) as [uuid, module]}
		<li title={uuid}>
			<span>{module.title}</span>
			<Button tertiary on:click={()=>dispatch('add', uuid)} title={$_('overlays.addModule', {values: {title: module.title}})}>
				<Icon icon='add'></Icon>
			</Button>
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
	span {
		display: flex;
		align-items: center;
		padding: .5em;
	}
</style>