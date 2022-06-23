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
</script>

<main>
	<Section alt rounded padded>
		<ItemGroup>
			{format('todo')}
		</ItemGroup>
	</Section>
</main>

<style>
</style>