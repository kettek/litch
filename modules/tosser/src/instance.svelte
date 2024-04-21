<script type='ts'>
	import { onMount } from "svelte"
	import type { ModuleChannel } from "@kettek/litch-app/src/interfaces/ModuleInstance"
  import type { SettingsInterface } from "./SettingsI"
	import { upgrade } from './upgrade'
  import type { AssetManager } from "@kettek/litch-app/src/interfaces/Asset"

	export let channel: ModuleChannel
	export let settings: SettingsInterface
	export let assets: AssetManager

	export let update: (v: any) => void

	let [changed, settings_] = upgrade(settings)
	if (changed) {
		update(settings_)
	}
	
	// Republish the static server port on new live view.
	channel.receive = async ({topic, message}) => {
		if (topic === 'refresh') {
			//
		} else if (topic.startsWith('trigger.')) {
			let triggerID = topic.split('.')[1]
			if (triggerID === 'toss') {
				console.log('tosser it', message.trigger)
			}
		}
	}

	onMount(() => {
		return () => {
		}
	})
</script>