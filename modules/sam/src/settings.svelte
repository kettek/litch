<script type="ts">
	import Button from '@kettek/litch-app/src/components/Button.svelte'
	import ItemGroup from '@kettek/litch-app/src/components/ItemGroup.svelte'
	import Section from '@kettek/litch-app/src/components/Section.svelte'

	import type { SettingsInterface } from './Settings'

	import type { AssetManager, AssetResult } from '@kettek/litch-app/src/interfaces/Asset'
	import type { Format } from '@kettek/litch-app/src/interfaces/Format'

	import type { ModuleChannel } from '@kettek/litch-app/src/interfaces/ModuleInstance'
	import { onMount } from 'svelte'

	export let format: Format

	export let channel: ModuleChannel

	export let settings: SettingsInterface

	function refresh() {
		settings = { ...settings }
	}

	function test() {
		channel.publish('say', {
			message: settings.example,
			options: settings.options,
		})
	}

	onMount(() => {
		return () => {
			channel.receive = null
		}
	})
</script>

<main>
	<Section alt padded>
		<ItemGroup label>
			<input bind:value={settings.example} on:change={refresh} />
			<svelte:fragment slot="label">{format('example')}</svelte:fragment>
		</ItemGroup>
	</Section>
	<Section alt padded>
		<ItemGroup label>
			<input type="number" bind:value={settings.options.volume} on:change={refresh} />
			<svelte:fragment slot="label">{format('volume')}</svelte:fragment>
		</ItemGroup>
		<!--ItemGroup label>
			<input type="checkbox" bind:checked={settings.options.phonetic} on:change={refresh} />
			<svelte:fragment slot="label">{format('phonetic')}</svelte:fragment>
		</ItemGroup-->
		<ItemGroup label>
			<input type="checkbox" bind:checked={settings.options.singmode} on:change={refresh} />
			<svelte:fragment slot="label">{format('singmode')}</svelte:fragment>
		</ItemGroup>
		<ItemGroup label>
			<input type="number" bind:value={settings.options.pitch} on:change={refresh} />
			<svelte:fragment slot="label">{format('pitch')}</svelte:fragment>
		</ItemGroup>
		<ItemGroup count={3} label>
			<input type="number" bind:value={settings.options.speed} on:change={refresh} />
			<svelte:fragment slot="label">{format('speed')}</svelte:fragment>
		</ItemGroup>
		<ItemGroup label>
			<input type="number" bind:value={settings.options.mouth} on:change={refresh} />
			<svelte:fragment slot="label">{format('mouth')}</svelte:fragment>
		</ItemGroup>
		<ItemGroup label>
			<input type="number" bind:value={settings.options.throat} on:change={refresh} />
			<svelte:fragment slot="label">{format('throat')}</svelte:fragment>
		</ItemGroup>
		<Button on:click={test}>
			{format('test')}
		</Button>
	</Section>
</main>

<style>
	main {
		display: grid;
		grid-template-rows: auto auto minmax(0, 1fr);
		overflow: auto;
		height: 100%;
	}
</style>
