<script type="ts">
	import type { Format } from '@kettek/litch-app/src/interfaces/Format'
	import type { SettingsInterface } from './SettingsI'

	export let settings: SettingsInterface
</script>

<div>
	{settings.message}
</div>

<style>
	div {
		color: red;
	}
</style>