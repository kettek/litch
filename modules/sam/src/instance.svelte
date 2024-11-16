<script type="ts">
	import { onMount } from 'svelte'
	import type { ModuleChannel } from '@kettek/litch-app/src/interfaces/ModuleInstance'
	import type { SayTriggerDataI } from './interfaces'
	import SamJs from 'sam-js'
	import { Options, SettingsInterface } from './Settings'

	export let channel: ModuleChannel
	export let settings: SettingsInterface

	let sam: SamJs

	function refreshSam(options?: Options) {
		sam = new SamJs({
			...settings.options,
			...options,
		})
	}

	function playByteArray(byteArray: Uint8Array, options?: Options) {
		const ctx = new AudioContext()
		const gain = ctx.createGain()
		gain.gain.value = options?.volume ?? settings.options.volume
		gain.connect(ctx.destination)
		try {
			ctx.decodeAudioData(byteArray.buffer, (buffer) => {
				try {
					const source = ctx.createBufferSource()
					source.buffer = buffer
					source.connect(gain)
					source.start()
				} catch (e) {
					console.error('error', e)
				}
			})
		} catch (e) {
			console.error('error', e)
		}
	}

	function triggerSay(trigger: SayTriggerDataI, action: Object) {
		let msg = trigger.message
		for (const prop in action) {
			msg = msg.replace(new RegExp('{' + prop + '}', 'g'), '{' + action[prop] + '}')
		}
		refreshSam(trigger.options)
		playByteArray(sam.wav(msg))
	}

	// Republish the static server port on new live view.
	channel.receive = async ({ topic, message }) => {
		if (topic === 'update') {
			settings = message
			refreshSam()
		} else if (topic === 'refresh') {
			refreshSam()
		} else if (topic.startsWith('trigger.')) {
			let triggerID = topic.split('.')[1]
			if (triggerID === 'say') {
				triggerSay(message.trigger, message.action)
			}
		} else if (topic === 'say') {
			triggerSay(message, {})
		}
	}

	onMount(() => {
		return () => {}
	})
</script>
