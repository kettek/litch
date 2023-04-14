<script lang='ts'>
	import Section from '@kettek/litch-app/src/components/Section.svelte'
	import Icon from '@kettek/litch-app/src/components/Icon.svelte'
	import ItemGroup from '@kettek/litch-app/src/components/ItemGroup.svelte'
	import DropList from '@kettek/litch-app/src/components/DropList.svelte'
	import Button from '@kettek/litch-app/src/components/Button.svelte'

	import { _ } from 'svelte-i18n'

	import { services } from './stores/services'
  import type { ActionEventsI } from './interfaces/Service'
  import ModuleWrapper from './ModuleWrapper.svelte'
	import ActionCondition from './ActionCondition.svelte'
	
	interface ActionI {
		service: string
		id: string
		condition: any
	}

	let actionSelect: HTMLSelectElement
	let actions: ActionI[] = []
	
	function addAction() {
		let parts = actionSelect.value.split('.', 2)
		actions = [...actions, {
			service: parts[0],
			id: parts[1],
			condition: {},
		}]
	}
</script>

<main>
	<ItemGroup label>
		<select bind:this={actionSelect}>
			{#each $services as service}
				{#if service.actionEvents?.conditions}
					{#each service.actionEvents.conditions as condition}
						<option value={service.uuid+'.'+condition.id}>{condition.title}</option>
					{/each}
				{/if}
			{/each}
		</select>
		<Button secondary on:click={addAction}>
			<Icon icon="add"></Icon>
		</Button>
	</ItemGroup>
	{#each actions as action}
		<DropList secondary>
			<svelte:fragment slot='heading'>{$_('action')}</svelte:fragment>
			<section class='action' slot='content'>
				<Section rounded class='action'>
					{#if $services.find(v=>v.uuid===action.service)}
						<ActionCondition service={$services.find(v=>v.uuid===action.service)} action={action}></ActionCondition>
					{/if}
				</Section>
			</section>
		</DropList>
	{/each}
</main>

<style>
</style>