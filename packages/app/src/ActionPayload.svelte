<script lang='ts'>
	import DropList from "./components/DropList.svelte"
  import Info from "./components/Info.svelte";
  import Section from "./components/Section.svelte";
	import type { ActionEventI, ActionServiceI } from "./interfaces/Action"
	import type { ServiceInterface } from "./interfaces/Service"
	import { _ } from 'svelte-i18n'

	export let service: ServiceInterface
	export let action: ActionServiceI
	let condition: ActionEventI | undefined
	$: condition = service?.actionEvents?.conditions?.find(v=>v.id===action.id)
</script>

{#if condition?.payload}
	<DropList tertiary>
		<svelte:fragment slot='heading'>{$_('actions.triggerVariables')}</svelte:fragment>
		<svelte:fragment slot='content'>
			<ul>
				{#each Object.entries(condition.payload) as [key, value]}
					<li title={$_(`service.${service.uuid}.conditions.${action.id}.${key}`)}>{key}</li>
				{/each}
			</ul>
			<Info tertiary>
				<aside>{$_('actions.variablesInfo')}</aside>
				<br>
				{$_('actions.variableExample')}: <code>{$_('actions.variablesInfoExample')}</code>
			</Info>
		</svelte:fragment>
	</DropList>
{/if}

<style>
	ul {
		display: flex;
		flex-wrap: wrap;
		list-style: none;
		margin: 0;
		padding: 0;
	}
	li {
		display: inline;
		padding: .5em;
		margin: .25em;
		border-radius: .75em;
		background: var(--nav-bg);
	}
	code {
		font-family: 'Courier New', Courier, monospace;
		font-size: 80%;
	}
</style>