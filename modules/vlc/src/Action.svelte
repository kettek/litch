<script lang='ts'>
	import type { ActionModuleI } from "@kettek/litch-app/src/interfaces/Action"
	import type { ModuleChannel } from '@kettek/litch-app/src/interfaces/ModuleInstance'
	import type { Publisher } from "@kettek/pubsub/dist/Publisher"

	export let channel: ModuleChannel
	export let actions: ActionModuleI[]
	export let publisher: Publisher
	export let data: any

	let statusTimers: Record<string, number> = {}
	let lastPlaying = ''

	function startStatusTimer(action: ActionModuleI) {
		let address = 'http://localhost:8080'
		let password = ''
		let interval = 5000
		if (action.condition.address) {
			address = action.condition.address
		}
		// Does VLC even allow passwordless?
		if (action.condition.password) {
			password = action.condition.password
		}
		if (action.condition.interval) {
			interval = Number(action.condition.interval)
		}
		let headers = new Headers()
		headers.append('Authorization', 'Basic ' + window.btoa(':' + password))
		if (statusTimers[action.uuid]) {
			window.clearTimeout(statusTimers[action.uuid])
		}
		statusTimers[action.uuid] = window.setTimeout(() => {
			startVLCStatus(action.uuid, address, headers)
		}, interval)
	}

	async function startVLCStatus(uuid: string, address: string, headers: Headers) {
		try {
			const response = await fetch(address+"/requests/status.json", {
				method: 'GET',
				headers,
			})
			const data = await response.json()
			let msg = {
				state: data.state,
				position: data.position,
				volume: data.volume,
				artist: data.information.category.meta.artist,
				artworkURL: data.information.category.meta.artwork_url,
				date: data.information.category.meta.date,
				filename: data.information.category.meta.filename,
				genre: data.information.category.meta.genre,
				title: data.information.category.meta.title,
				album: data.information.category.meta.album,
			}
			let songId = `${msg.artist}${msg.title}${msg.album}`
			if (msg.state === 'playing' && lastPlaying !== songId) {
				lastPlaying = songId
				publisher.publish(`actions.${uuid}.trigger`, msg)
			}
			//publisher.publish(`actions.${uuid}.trigger`, msg)
		} catch(e) {
			//console.error(e)
			// TODO: log this somewhere not spammy.
		}
		startStatusTimer(actions.find(v=>v.uuid===uuid))
	}

	$: {
		for (let action of actions) {
			if (action.id === 'vlc-status') {
				startStatusTimer(action)
			}
		}
	}
</script>