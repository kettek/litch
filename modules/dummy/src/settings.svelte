<script type="ts">
	import type { Format } from '@kettek/litch-app/src/interfaces/Format'
	import type { SettingsInterface } from './SettingsI'

	import Section from '@kettek/litch-app/src/components/Section.svelte'
	import ItemGroup from '@kettek/litch-app/src/components/ItemGroup.svelte'

	export let settings: SettingsInterface
	export let format: Format
</script>

<div>
	<Section alt padded rounded>
		<ItemGroup label>
			<input type='text' bind:value={settings.message}/>
			<svelte:fragment slot='label'>
				{format('message')}
			</svelte:fragment>
		</ItemGroup>
	</Section>
</div>

<style>
	div {
		color: red;
	}
</style>