<script lang='ts'>
	import type { Format } from '@kettek/litch-app/src/interfaces/Format'
  import ItemGroup from '@kettek/litch-app/src/components/ItemGroup.svelte'
  import Info from '@kettek/litch-app/src/components/Info.svelte'
  import type { PopupTriggerDataI } from './interfaces'
	
	export let format: Format
	export let data: PopupTriggerDataI
	export let refresh: () => void

</script>

<main draggable="true" on:dragstart|preventDefault|stopPropagation>
	<ItemGroup label>
		<input bind:value={data.message} on:change={refresh}/>
		<svelte:fragment slot='label'>
			{format('popup.message')}
		</svelte:fragment>
	</ItemGroup>
	<aside>
		<div>
			<header>word styles</header>
			<ul>
				<li>rainbow</li>
				<li>vibrate</li>
				<li>bounce</li>
			</ul>
		</div>
		<div>
			<header>rune styles</header>
			<ul>
				<li>wiggle</li>
				<li>card</li>
				<li>flip</li>
			</ul>
		</div>
	</aside>
</main>

<style>
	aside {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		padding: .5em;
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
		border-radius: .25em;
		border: 1px solid transparent;
	}
</style>