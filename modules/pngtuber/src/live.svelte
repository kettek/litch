<script type="ts">
	import type { ModuleChannel } from '@kettek/litch-app/src/interfaces/ModuleInstance'
	import { onMount } from 'svelte'

	export let channel: ModuleChannel
	export let live: any = {}

	let reference: string = live.reference

	onMount(() => {
		channel.receive = async ({topic, message}) => {
			if (topic === 'setImage') {
				console.log(Date.now() - message.ts)
				reference = message.reference
			}
		}
	})
</script>

<img alt='' src='{reference}'/>

<style>
	img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
</style>