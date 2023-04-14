<script lang='ts'>
	import Section from '@kettek/litch-app/src/components/Section.svelte'
	import Icon from '@kettek/litch-app/src/components/Icon.svelte'
	import ItemGroup from '@kettek/litch-app/src/components/ItemGroup.svelte'
	import DropList from '@kettek/litch-app/src/components/DropList.svelte'
	import Button from '@kettek/litch-app/src/components/Button.svelte'

	import { _ } from 'svelte-i18n'
	import { v4 } from 'uuid'

	import { actions, addAction, removeAction } from './stores/actions'
	import { services } from './stores/services'
	import ActionCondition from './ActionCondition.svelte'
	
	let actionSelect: HTMLSelectElement

	function addNewAction() {
		let parts = actionSelect.value.split('.', 2)
		addAction({
			uuid: v4(),
			service: parts[0],
			id: parts[1],
			condition: {},
		})
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
		<Button secondary on:click={addNewAction}>
			<Icon icon="add"></Icon>
		</Button>
	</ItemGroup>
	{#each $actions as action}
		<DropList secondary>
			<svelte:fragment slot='heading'>{$_('action')}</svelte:fragment>
			<section class='action' slot='content'>
				<Section rounded class='action'>
					{#if $services.find(v=>v.uuid===action.service)}
						<ActionCondition service={$services.find(v=>v.uuid===action.service)} action={action}></ActionCondition>
					{/if}
				</Section>
				<Button secondary dangerous on:click={()=>removeAction(action.uuid)}>
					<Icon icon="delete"></Icon>
				</Button>
			</section>
		</DropList>
	{/each}
</main>

<style>
</style>