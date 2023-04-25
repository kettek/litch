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
	
	function randomize(index: number, collection: string) {
		if (!settings.groups[index]) return
		let results = assets.collectionAssets(collection)
		if (results.length === 0) return
		let asset = results[Math.floor(Math.random()*results.length)]
		settings.groups[index].reference.collection = collection
		settings.groups[index].reference.asset = asset.uuid
		settings.groups[index].reference.mimetype = asset.mimetype
		settings.groups[index].reference.name = asset.name
		update(settings)
	}

	// Republish the static server port on new live view.
	channel.receive = async ({topic, message}) => {
		if (topic === 'refresh') {
			//
		} else if (topic.startsWith('trigger.')) {
			let triggerID = topic.split('.')[1]
			if (triggerID === 'randomize') {
				randomize(message.trigger.groupIndex, message.trigger.targetCollection)
			}
		}
	}

	onMount(() => {
		return () => {
		}
	})
</script>