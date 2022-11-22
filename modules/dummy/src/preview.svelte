<script type="ts">
	import type { Format } from '@kettek/litch-app/src/interfaces/Format'
	import type { SettingsI } from './SettingsI'

	export let settings: SettingsI
</script>

<div>
	{settings.message}
</div>

<style>
	div {
		color: red;
	}
</style>