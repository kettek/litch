<script lang='ts'>
  import type { Format } from "@kettek/litch-app/src/interfaces/Format"
  import type { SettingsInterface } from "./interfaces"
  import Info from '@kettek/litch-app/src/components/Info.svelte'
  import ItemGroup from "@kettek/litch-app/src/components/ItemGroup.svelte"


	interface Data {
		message: string
	}

	export let format: Format
	export let settings: SettingsInterface
	export let data: Data
	export let refresh: () => void
</script>

<main draggable='true' on:dragstart|preventDefault|stopPropagation>
	<ItemGroup count={2} label>
		<input type='text' bind:value={data.message} on:change={refresh}/>
		<svelte:fragment slot='label'>{format('triggers.chat.message')}</svelte:fragment>
	</ItemGroup>
	<Info tertiary>
		{format('triggers.chat.messageInfo')}
	</Info>
</main>