<script type="ts">
	import TabBar from '@kettek/litch-app/src/components/TabBar.svelte'
	import Tab from '@kettek/litch-app/src/components/Tab.svelte'
	import Button from '@kettek/litch-app/src/components/Button.svelte'
	import Icon from '@kettek/litch-app/src/components/Icon.svelte'
  import ItemGroup from '@kettek/litch-app/src/components/ItemGroup.svelte'
	import ItemBar from '@kettek/litch-app/src/components/ItemBar.svelte'
	import Section from '@kettek/litch-app/src/components/Section.svelte'

	import type { SettingsInterface } from './Settings'
  import { parseToHTML } from './parser'

	import type { AssetManager, AssetResult } from '@kettek/litch-app/src/interfaces/Asset'
	import type { Format } from '@kettek/litch-app/src/interfaces/Format'

	import type { ModuleChannel } from '@kettek/litch-app/src/interfaces/ModuleInstance'
	import { onMount } from 'svelte'

	export let format: Format

	export let channel: ModuleChannel

	export let settings: SettingsInterface

	export let assets: AssetManager

	export let update: (value: any) => void
	
	function refresh() {
		settings = { ...settings }
	}

	function test() {
		channel.publish('alert', {
			message: parseToHTML(settings.example),
			lifetime: settings.example.length*70,
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
			<input bind:value={settings.example} on:change={refresh}>
			<svelte:fragment slot='label'>{format('example')}</svelte:fragment>
		</ItemGroup>
	</Section>
	<Section alt padded>
		<ItemGroup label>
			<input type='color' bind:value={settings.style.focusColor} on:change={refresh}>
			<svelte:fragment slot='label'>{format('focusColor')}</svelte:fragment>
		</ItemGroup>
		<ItemGroup label>
			<input type='color' bind:value={settings.style.textColor} on:change={refresh}>
			<svelte:fragment slot='label'>{format('textColor')}</svelte:fragment>
		</ItemGroup>
		<ItemGroup label>
			<input type='color' bind:value={settings.style.outlineColor} on:change={refresh}>
			<svelte:fragment slot='label'>{format('outlineColor')}</svelte:fragment>
		</ItemGroup>
		<ItemGroup label>
			<input type='size' bind:value={settings.style.size} on:change={refresh}>
			<svelte:fragment slot='label'>{format('size')}</svelte:fragment>
		</ItemGroup>
		<ItemGroup label>
			<textarea bind:value={settings.style.css} on:change={refresh}></textarea>
			<svelte:fragment slot='label'>{format('css')}</svelte:fragment>
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