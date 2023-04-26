<script type='ts'>
	import { onMount } from 'svelte'
	import type { ModuleChannel } from '@kettek/litch-app/src/interfaces/ModuleInstance'
	import type { MutedTriggerDataI } from './triggers'
  import type { SettingsInterface } from './Settings';

	export let channel: ModuleChannel
	export let settings: SettingsInterface
	export let update: (v: any) => void

	onMount(() => {
		
		channel.receive = async ({topic, message}) => {
			if (topic.startsWith('trigger.')) {
				let triggerID = topic.split('.')[1]
				if (triggerID === 'mute') {
					settings.muted = message.trigger.mute ? true : false
					update(settings)
				}
			}
		}

		// TODO: Populate audio input list & request for last known selection. Also update on settings change for audio input.
		return () => {
			// ???
		}
	})
</script>