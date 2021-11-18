<script lang="ts">
	import { onMount } from 'svelte'

	import { isHello, LitchMessage } from './api'

	let webSocket: WebSocket | undefined
	let connected: boolean = false
	let backoff: number = 100
	let uuid: string = ''

	async function startWs() {
		const parsedUrl = new URL(window.location.href)

		try {
			await new Promise((resolve: (value: void) => void, reject: (reason: any) => void) => {
				webSocket = new WebSocket(`ws://${parsedUrl.host}`)
				webSocket.onerror = (ev: Event) => {
					reject(ev)
				}
				webSocket.onclose = (ev: CloseEvent) => {
					webSocket = undefined
					connected = false
					reconnect()
				}
				webSocket.onopen = (ev: Event) => {
					resolve()
				}
				webSocket.onmessage = (ev: any) => {
					let msg = JSON.parse(ev.data)
					if (isHello(msg)) {
						uuid = msg.uuid
						webSocket?.send(JSON.stringify({event: 'hello', uuid: uuid}))
						console.log(`hello ${msg.uuid}`)
					} else {
						console.log('got unhandled :(')
					}
				}
			})
			connected = true
		} catch(err: any) {
			connected = false
			webSocket = undefined
		}
	}


	let t: NodeJS.Timeout

	function reconnect() {
		t = setTimeout(() => {
			clearTimeout(t)
			if (connected === false) {
				startWs()
				backoff *= 2
				reconnect()
			} else {
				backoff = 100
			}
		}, backoff)
	}

	onMount(() => {
		reconnect()
	})
</script>

{#if connected}
	connected
{:else}
	loading...
{/if}

<style>
</style>