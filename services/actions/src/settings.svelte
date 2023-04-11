<script type="ts">
	import { flip } from 'svelte/animate'
	import Section from '@kettek/litch-app/src/components/Section.svelte'
	import Icon from '@kettek/litch-app/src/components/Icon.svelte'
	import ItemGroup from '@kettek/litch-app/src/components/ItemGroup.svelte'
	import DropList from '@kettek/litch-app/src/components/DropList.svelte'
	import Button from '@kettek/litch-app/src/components/Button.svelte'
	import type { ServiceChannel } from '@kettek/litch-app/src/interfaces/Service'
	import type { SettingsInterface } from './Settings'
	import type { Format } from '@kettek/litch-app/src/interfaces/Format'

	export let format: Format

	export let settings: SettingsInterface
	export let channel: ServiceChannel
	
	interface ActionI {
		type: 'chat'|'sub'|'subgift'|'points'|'reward'|'cheer'|'hype'|'raid',
	}
	
	interface ActionChat {
		type: 'chat'
	}
	function isActionChat(object: ActionI): object is ActionChat {
		return object.type === 'chat'
	}
	
	interface ActionSub {
		type: 'sub'
	}
	function isActionSub(object: ActionI): object is ActionSub {
		return object.type === 'sub'
	}
	
	interface ActionSubGift {
		type: 'subgift'
	}
	function isActionSubGift(object: ActionI): object is ActionSubGift {
		return object.type === 'subgift'
	}

	interface ActionPoints {
		type: 'points'
	}
	function isActionPoints(object: ActionI): object is ActionPoints {
		return object.type === 'points'
	}

	interface ActionReward {
		type: 'reward'
	}
	function isActionReward(object: ActionI): object is ActionReward {
		return object.type === 'reward'
	}

	interface ActionCheer {
		type: 'cheer'
	}
	function isActionCheer(object: ActionI): object is ActionCheer {
		return object.type === 'cheer'
	}


	interface ActionHype {
		type: 'hype'
	}
	function isActionHype(object: ActionI): object is ActionHype {
		return object.type === 'hype'
	}

	interface ActionRaid {
		type: 'raid'
	}
	function isActionRaid(object: ActionI): object is ActionRaid {
		return object.type === 'raid'
	}

	let actions: ActionI[] = []
	
	function addAction() {
		actions = [...actions, {
			type: 'chat',
		}]
		// TODO
	}
</script>

<main>
	<ItemGroup label>
		<Button secondary on:click={addAction}>
			<Icon icon="add"></Icon>
		</Button>
	</ItemGroup>
		{#each actions as action}
			<DropList secondary>
				<svelte:fragment slot='heading'>{format('action')}: {format(action.type)}</svelte:fragment>
				<section class='action' slot='content'>
					<Section rounded class='action'>
						<select bind:value={action.type}>
							<option value='chat'>{format('chatMessage')}</option>
							<option value='sub'>{format('subscription')}</option>
							<option value='subgift'>{format('subscriptionGift')}</option>
							<option value='points'>{format('points')}</option>
							<option value='follow'>{format('follow')}</option>
							<option value='reward'>{format('reward')}</option>
							<option value='cheer'>{format('cheer')}</option>
							<option value='hype'>{format('hype')}</option>
							<option value='raid'>{format('raid')}</option>
						</select>
					</Section>
					<Section rounded>
					{#if isActionChat(action)}
					chat
					{:else if isActionSub(action)}
					sub
					{:else if isActionSubGift(action)}
					gift
					{:else if isActionReward(action)}
					reward
					{:else if isActionCheer(action)}
					cheer
					{:else if isActionHype(action)}
					hype
					{:else if isActionRaid(action)}
					raid
					{/if}
					</Section>
				</section>
			</DropList>
		{/each}
</main>

<style>
	.action {
		display: flex;
		flex-direction: row;
	}
</style>