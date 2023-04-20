<script type='ts'>
	import { onMount } from "svelte"
	import type { ModuleChannel } from "@kettek/litch-app/src/interfaces/ModuleInstance"

	export let channel: ModuleChannel

	// Republish the static server port on new live view.
	channel.receive = async ({topic, message}) => {
		console.log('argh', topic, message)
		if (topic === 'refresh') {
			//
		} else if (topic === 'trigger') {
			console.log('got trigger', message)
		}
	}

	onMount(() => {
		return () => {
		}
	})
</script>