<script lang='ts'>
  import { onMount } from 'svelte'

	import type { ServiceChannel } from '@kettek/litch-app/src/interfaces/Service'
	import type { ServiceData } from './interfaces'
	
	export let data: ServiceData
	export let channel: ServiceChannel
	export let updateData: (data: any) => void

	channel.receive = async ({topic, message}: {topic: string, message: any}) => {
		if (topic === 'channelPoints.addReward') {
			console.log('TODO: add', message)
		} else if (topic === 'channelPoints.clearRewards') {
			updateData({...data, redeems: []})
		} else if (topic === 'channelPoints.redeem') {
			console.log('TODO: redeem', message)
		} else {
			console.log('UNHANDLED: ', topic, message)
		}
	}
	
	onMount(() => {
		updateData({...data, redeems: []})
	})
</script>

<main>
</main>