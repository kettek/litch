<script type="ts">
	import type { ModuleChannel } from '@kettek/litch-app/src/interfaces/ModuleInstance'
	import type { AssetManager } from '@kettek/litch-app/src/interfaces/Asset'
	import type { SettingsInterface } from './Settings'

	export let channel: ModuleChannel
	export let assets: AssetManager
	export let settings: SettingsInterface

	channel.receive = async ({topic, message}) => {
		console.log('live.receive', topic, message)
	}
</script>

<div>
</div>

<style>
	div {
		width: 100%;
		height: 100%;
	}
	article {
		position: absolute;
		overflow: hidden;
	}
</style>