<script lang='ts'>
	import type { Format } from '@kettek/litch-app/src/interfaces/Format'
  import Info from '@kettek/litch-app/src/components/Info.svelte'

	export let format: Format
</script>

<main draggable='true' on:dragstart|preventDefault|stopPropagation>
	<Info tertiary>
		{format('clearTempAction.info')}
	</Info>
</main>

<style>
</style>