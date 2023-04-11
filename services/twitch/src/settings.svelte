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
		channel.publish('say', {channel: settings.channel, message: saying})
		saying = ''
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
			<input type='text' bind:value={settings.channel}>
			<svelte:fragment slot='label'>
				{format('user')}
			</svelte:fragment>
		</ItemGroup>
		<ItemGroup label>
			<input type='checkbox' bind:checked={settings.dumpAllMessages}>
			<svelte:fragment slot='label'>
				{format('dumpAllMessages')}
			</svelte:fragment>
		</ItemGroup>
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