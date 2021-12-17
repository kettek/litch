<script type="ts">
	import type { ModuleChannel } from '@kettek/litch-app/src/interfaces/ModuleInstance'
	import type { AssetManager, AssetResult } from '@kettek/litch-app/src/interfaces/Asset'
	import { onMount } from 'svelte'

	export let assets: AssetManager
	export let channel: ModuleChannel
	export let live: any = {}

	let reference: AssetResult = live.reference

	onMount(() => {
		channel.receive = async ({topic, message}) => {
			if (topic === 'setImage') {
				console.log(Date.now() - message.ts)
				reference = message.reference
			}
		}
	})
</script>

<img alt='' src='{assets.source(reference)}'/>

<style>
	img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
</style>