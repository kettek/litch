<script type="ts">
	import TabBar from '@kettek/litch-app/src/components/TabBar.svelte'
	import Tab from '@kettek/litch-app/src/components/Tab.svelte'
	import Button from '@kettek/litch-app/src/components/Button.svelte'
	import Icon from '@kettek/litch-app/src/components/Icon.svelte'
	import ItemBar from '@kettek/litch-app/src/components/ItemBar.svelte'
	import Section from '@kettek/litch-app/src/components/Section.svelte'

	import type { SettingsInterface } from './Settings'

	import type { AssetManager, AssetResult } from '@kettek/litch-app/src/interfaces/Asset'
	import type { Format } from '@kettek/litch-app/src/interfaces/Format'

	import type { ModuleChannel } from '@kettek/litch-app/src/interfaces/ModuleInstance'
	import { onMount } from 'svelte'

	export let format: Format

	export let channel: ModuleChannel

	export let settings: SettingsInterface = {
		styles: [],
	}

	export let assets: AssetManager

	export let update: (value: any) => void
	
	function refresh() {
		settings = { ...settings }
	}
	
	let selectedStyleIndex: number = 0
	function addStyle() {
		settings.styles.push({
			name: `style ${settings.styles.length+1}`,
			outlineColor: '#ff00ff',
			textColor: '#ffffff',
			focusColor: '#ffff00',
			css: '',
		})
		selectedStyleIndex = settings.styles.length-1
		refresh()
	}
	
	function removeStyle(index: number) {
		settings.styles.splice(index, 1)
		if (selectedStyleIndex > settings.styles.length-1) {
			selectedStyleIndex--
		}
		refresh()
	}

	onMount(() => {
		return () => {
			channel.receive = null
		}
	})
</script>

<main>
	<TabBar>
		{#each settings.styles as style, index}
			<Tab tertiary selected={index===selectedStyleIndex} on:click={()=>selectedStyleIndex=index}>
				{style.name||index}
			</Tab>
		{/each}
		<svelte:fragment slot='controls'>
			<Button tertiary small on:click={addStyle}>
				<Icon icon='add'></Icon>
			</Button>
		</svelte:fragment>
	</TabBar>
	{#if settings.styles[selectedStyleIndex]}
		<ItemBar alt round='top'>
			<Button dangerous on:click={()=>removeStyle(selectedStyleIndex)} title={format('removeStyle')}>
				<Icon icon='delete'></Icon>
			</Button>
		</ItemBar>
		<Section alt round='bottom' padded>
		</Section>
	{/if}
</main>

<style>
	main {
		display: grid;
		grid-template-rows: auto auto minmax(0, 1fr);
		overflow: auto;
		height: 100%;
	}
</style>