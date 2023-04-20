<script type='ts'>
	import { onMount } from "svelte"
	import type { ModuleChannel } from "@kettek/litch-app/src/interfaces/ModuleInstance"
	import type { PopupTriggerDataI } from "./interfaces"

	export let channel: ModuleChannel

	function triggerPopup(trigger: PopupTriggerDataI, action: Object) {
		let msg = trigger.message
		for (const prop in action) {
			msg = msg.replace(new RegExp('{'+prop+'}', 'g'), action[prop])
		}
		console.log('output', msg)
	}

	// Republish the static server port on new live view.
	channel.receive = async ({topic, message}) => {
		if (topic === 'refresh') {
			//
		} else if (topic.startsWith('trigger.')) {
			let triggerID = topic.split('.')[1]
			if (triggerID === 'popup') {
				triggerPopup(message.trigger, message.action)
			}
		}
	}

	onMount(() => {
		return () => {
		}
	})
</script>