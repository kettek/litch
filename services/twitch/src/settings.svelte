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

	let saying: string = ''
	function say() {
		// FOR NOW
		for (let ch of settings.chatBot.channels) {
			channel.publish('say', {channel: ch, message: saying})
		}
		saying = ''
	}

	let addingChannel: string = ''

	function addChannel(name: string) {
		if (!settings.chatBot.channels.find(v=>v===name)) {
			settings.chatBot.channels.push(name)
			addingChannel = ''
			settings = {...settings}
		}
	}

	function removeChannel(name: string) {
		settings.chatBot.channels = settings.chatBot.channels.filter(v=>v!==name)
		settings = {...settings}
	}

	function revoke() {
		channel.publish('logout', {})
	}
</script>

<main>
	<Section alt rounded padded>
		<ItemGroup>
			<Button dangerous on:click={revoke}>
				{format('revoke')}
			</Button>
		</ItemGroup>
		<ItemGroup label>
			<input type='text' bind:value={settings.clientID}>
			<svelte:fragment slot='label'>
				{format('clientID')}
			</svelte:fragment>
		</ItemGroup>
		<ItemGroup label>
			<input type='checkbox' bind:checked={settings.dumpAllMessages}>
			<svelte:fragment slot='label'>
				{format('dumpAllMessages')}
			</svelte:fragment>
		</ItemGroup>
		<ItemGroup label>
			<input type='checkbox' bind:checked={settings.chatBot.enabled}>
			<svelte:fragment slot='label'>
				{format('chatBot')}
			</svelte:fragment>
		</ItemGroup>
		{#if settings.chatBot.enabled}
			<ItemGroup label>
				<input type='text' bind:value={settings.chatBot.name}>
				<svelte:fragment slot='label'>
					{format('name')}
				</svelte:fragment>
			</ItemGroup>
			<ItemGroup label>
				<input type='text' bind:value={settings.chatBot.prefix}>
				<svelte:fragment slot='label'>
					{format('prefix')}
				</svelte:fragment>
			</ItemGroup>
			<ItemGroup label>
				<input type='text' bind:value={settings.chatBot.suffix}>
				<svelte:fragment slot='label'>
					{format('suffix')}
				</svelte:fragment>
			</ItemGroup>
			<ItemGroup label>
				<input type='text' bind:value={settings.chatBot.joinMessage}>
				<svelte:fragment slot='label'>
					{format('joinMessage')}
				</svelte:fragment>
			</ItemGroup>
			<ItemGroup label>
				<input type='text' bind:value={settings.chatBot.leaveMessage}>
				<svelte:fragment slot='label'>
					{format('leaveMessage')}
				</svelte:fragment>
			</ItemGroup>
			<ItemGroup label>
				<input type='text' bind:value={addingChannel}>
				<Button tertiary on:click={()=>addChannel(addingChannel)} title={format('addChannel_desc')}>
					<Icon icon='add'></Icon>
				</Button>
				<svelte:fragment slot='label'>
					{format('addChannel')}
				</svelte:fragment>
			</ItemGroup>

			<DropList bind:open={settings.chatBot.openChannels} tertiary>
				<svelte:fragment slot="heading">
					{format('channels')}
				</svelte:fragment>
				<svelte:fragment slot="content">
					<ul>
					{#each settings.chatBot.channels as channel (channel)}
						<li animate:flip="{{duration: 200}}">
							<span>{channel}</span>
							<Button tertiary on:click={()=>removeChannel(channel)} title={format('removeChannel_desc')}>
								<Icon icon='remove'></Icon>
							</Button>
						</li>
					{/each}
					</ul>
				</svelte:fragment>
			</DropList>

		{/if}
	</Section>
	<Section alt rounded padded>
		<ItemGroup>
			<input type='text' bind:value={saying}>
			<Button secondary on:click={say}>
				{format('say')}
			</Button>
		</ItemGroup>
	</Section>
</main>

<style>
</style>