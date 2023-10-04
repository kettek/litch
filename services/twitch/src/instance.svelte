<script lang='ts'>
  import { onMount } from 'svelte'

	import type { ServiceChannel } from '@kettek/litch-app/src/interfaces/Service'
	import type { ServiceData } from './interfaces'
  import type { ActionServiceI } from '@kettek/litch-app/src/interfaces/Action'
	import type { Publisher } from "@kettek/pubsub/dist/Publisher"
	
	export let data: ServiceData
	export let publisher: Publisher
	export let channel: ServiceChannel
	export let actions: ActionServiceI[]
	export let updateData: (data: any) => void

	// TODO: Add interfaces for all these messaage types and use whatever typescript's type coercion code is.
	channel.receive = async ({topic, message}: {topic: string, message: any}) => {
		if (topic === 'channelPoints.addReward') {
			updateData({...data, 
				redeems: [
					...data.redeems,
					{
						id: message.id,
						title: message.title,
						cost: message.cost,
						image: message.image,
					}
				].sort((a,b)=>a.cost-b.cost)
			})
		} else if (topic === 'channelPoints.clearRewards') {
			updateData({...data, redeems: []})
		} else if (topic === 'channelPoints.redemption') {
			for (let action of actions) {
				if (action.id === 'redeem' && action.condition.id == message.rewardID) {
					publisher.publish(`actions.${action.uuid}.trigger`, message)
				}
			}
		} else if (topic === 'raid.start') {
			for (let action of actions) {
				if (action.id === 'raid' && !action.condition.cancel) {
					publisher.publish(`actions.${action.uuid}.trigger`, message)
				}
			}
		} else if (topic === 'raid.cancel') {
			for (let action of actions) {
				if (action.id === 'raid' && action.condition.cancel) {
					publisher.publish(`actions.${action.uuid}.trigger`, message)
				}
			}
		} else if (topic === 'chat.message') {
			for (let action of actions) {
				if (action.id === 'chat') {
					let userMatches = []
					let messageMatches = []
					if (action.condition.messageRegex) {
						// Get matches for messageRegex against message.msg
						messageMatches = message.msg.match(new RegExp(action.condition.messageRegex))
						// If there are no matches, continue
						if (!messageMatches) continue
						messageMatches = messageMatches.slice(1)
					}
					if (action.condition.userRegex) {
						// Get matches for userRegex against message.user
						userMatches = message.user.match(new RegExp(action.condition.userRegex))
						// If there are no matches, continue
						if (!userMatches) continue
						userMatches = userMatches.slice(1)
					}
					publisher.publish(`actions.${action.uuid}.trigger`, {
						userMatches,
						messageMatches,
						userName: message.user,
						message: message.msg,
					})
				}
			}
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