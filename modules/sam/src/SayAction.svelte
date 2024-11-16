<script lang="ts">
	import type { Format } from '@kettek/litch-app/src/interfaces/Format'
	import ItemGroup from '@kettek/litch-app/src/components/ItemGroup.svelte'
	import type { SayTriggerDataI } from './interfaces'

	export let format: Format
	export let data: SayTriggerDataI
	export let refresh: () => void
</script>

<main draggable="true" on:dragstart|preventDefault|stopPropagation>
	<ItemGroup label noAlt>
		<input bind:value={data.message} on:change={refresh} />
		<svelte:fragment slot="label">
			{format('say.message')}
		</svelte:fragment>
	</ItemGroup>
</main>

<style>
	aside {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		padding: 0.5em;
	}
	header {
		padding: 0.25em;
		margin: 0.5em;
		font-weight: bold;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
	}
	li {
		list-style: none;
		color: var(--tertiary);
		background: var(--bar-bg);
		margin: 0.25em;
		padding: 0.25em;
		border-radius: 0.25em;
		border: 1px solid transparent;
	}
</style>
