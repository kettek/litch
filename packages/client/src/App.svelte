<script lang="ts">
	import { onMount } from 'svelte'
	import { fade } from 'svelte/transition'

	import ModuleWrapper from './ModuleWrapper.svelte'

	import { isHello, isLazyUpdate, isModuleTypeResponse, isEndpoint, LitchMessage, Endpoint, ModuleTypeRequest } from '@kettek/litch-app/src/api'

	import type { OverlayInterface } from '@kettek/litch-app/src/interfaces/Overlay'
	import type { ModuleInterface } from '@kettek/litch-app/src/interfaces/Module'
	import type { ModuleChannel } from '@kettek/litch-app/src/interfaces/ModuleInstance'
	import type { AssetManager, AssetResult, AssetResults } from '@kettek/litch-app/src/interfaces/Asset'

	import { Publisher } from '@kettek/pubsub'
	import type { PublishedMessage } from "@kettek/pubsub/dist/Subscriber"

	const publisher = new Publisher()
	const endpoint = publisher.connect('*')
	const collectionsUpdater  = publisher.subscribe('collections.reference', async ({message}) => {
		collectionsReference = message
	})
	let collectionsReference = ''
	let referenceIncrementer = 0
	let assets: AssetManager = {
		open: async (options: any): Promise<AssetResults> => {
			return []
		},
		source: (ref: AssetResult): string => {
			return `${collectionsReference}/${ref.collection}/${ref.asset}`
			//return `${collectionsReference}/${ref.collection}/${ref.asset}?${referenceIncrementer++}`
		}
	}

	function createModuleChannel(overlayUUID: string, uuid: string): ModuleChannel {
		let ctx = `overlay.${overlayUUID}.module.${uuid}`
		let s = publisher.subscribe(`${ctx}.*`)

		let m = {
			handler: async (msg: any) => {
				// strip the topics
				msg = {
					...msg,
					sourceTopic: msg.sourceTopic.substring(ctx.length+1),
					topic: msg.sourceTopic.substring(ctx.length+1),
				}
				await m.receive(msg)
			},
			receive: async (msg: PublishedMessage) => {
				// To be overridden by the module.
			},
			publish: (topic: string, msg: any) => {
				//publisher.publish(s, `${ctx}.${topic}`, msg)
				// FIXME
				publisher.publish(`${ctx}.${topic}`, msg)
			},
			subscribe: (topic: string): ()=> void => {
				// TODO: Limit topics to subscribe to
				publisher.subscribe(topic, s)
				return () => {
					publisher.unsubscribe(topic, s)
				}
			},
			unsubscribe: (topic?: string) => {
				if (topic === undefined) {
					publisher.unsubscribe(s)
				} else {
					publisher.unsubscribe(topic, s)
				}
			},
			update: (topic: string, msg: any) => {
				// OVERRIDE
			}
		}

		s.handler = m.handler

		return m
	}


	let webSocket: WebSocket | undefined
	let connected: boolean = false
	let shown: boolean = true
	let backoff: number = 100
	let uuid: string = ''

	let overlay: OverlayInterface = {
		title: '',
		uuid: '',
		canvas: {x: 0, y: 0, width: 0, height: 0},
		modules: [],
	}

	async function receivePublish(msg: Endpoint) {
		publisher.publish(endpoint, msg.data)
	}

	async function startWs() {
		const parsedUrl = new URL(window.location.href)

		// Clear out overlay on start.
		overlay = {
			title: '',
			uuid: '',
			canvas: {x: 0, y: 0, width: 0, height: 0},
			modules: [],
		}

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
					} else if (msg.event === 'ready') {
						// TODO: Something???
					} else if (isLazyUpdate(msg)) {
						// If we're loaded from an /overlays/ path, ensure we are not shown if the overlay is not meant for us.
						const parsedUrl = new URL(window.location.href)
						if (parsedUrl.pathname.startsWith('/overlays/')) {
							if (msg.overlayUUID !== parsedUrl.pathname.substring(('/overlays/').length)) {
								shown = false
								return
							} else {
								shown = true
							}
						} else {
							shown = true
						}
						if (overlay.uuid !== msg.overlayUUID) {
							// Overlay change, remove all channels.
							for (let m of overlay.modules) {
								delete readiedModules[m.uuid]
								if (modulesChannels[m.uuid]) {
									modulesChannels[m.uuid].unsubscribe()
									delete modulesChannels[m.uuid]
								}
							}
						} else {
							// Remove any module channels that don't exist.
							for (let m of overlay.modules) {
								delete readiedModules[m.uuid]
								if (!msg.modules.find(v=>v.uuid===m.uuid)) {
									// Module was removed.
									if (modulesChannels[m.uuid]) {
										modulesChannels[m.uuid].unsubscribe()
										delete modulesChannels[m.uuid]
									}
								}
							}
						}
						// Ensure modules have channels
						for (let m of msg.modules) {
							if (!modulesChannels[m.uuid]) {
								modulesChannels[m.uuid] = createModuleChannel(msg.overlayUUID, m.uuid)
							}
						}
						overlay = {
							...overlay,
							canvas: msg.box,
							modules: msg.modules,
							uuid: msg.overlayUUID,
						}
						checkOverlayModules()
					} else if (isModuleTypeResponse(msg)) {
						addModule(msg.uuid, msg.file)
					} else if (isEndpoint(msg)) {
						receivePublish(msg)
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

	// readiedModules store moduleUUID readied state for if they've been readied in the DOM yet.
	let readiedModules: {
		[key: string]: boolean
	} = {}
	let modulesStore: Record<string, ModuleInterface> = {} // null signifies pending, Error is when it fails.
	let modulesState: Record<string, 'requesting'|'done'|'missing'|'error'> = {}
	let modulesChannels: Record<string, ModuleChannel> = {}
	function checkOverlayModules() {
		for (let m of overlay.modules) {
			if (modulesState[m.moduleUUID] === undefined) {
				// Request, as we have not yet heard of it.
				requestModule(m.moduleUUID)
			} else {
				// Failed, loading, or missing.
			}
		}
	}
	function requestModule(uuid: string) {
		modulesState[uuid] = 'requesting'
		let m: ModuleTypeRequest = {
			event: 'module-request',
			uuid,
		}
		webSocket?.send(JSON.stringify(m))
	}
	async function addModule(uuid: string, path: string) {
		if (path === '') {
			modulesState[uuid] = 'missing'
			return
		}
		const url = `${path}`
		try {
			let m: ModuleInterface = (await import(url)).default as unknown as ModuleInterface
			modulesStore[uuid] = m
			modulesState[uuid] = 'done'
		} catch(err: any) { // FIXME: Does await import failure have an error type?
			modulesState[uuid] = 'error'
		}
	}
	function refreshModule(uuid: string) {
		readiedModules[uuid] = true
		webSocket?.send(JSON.stringify({event: 'module-refresh', uuid: uuid}))
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

<main>
	{#if connected && shown}
		{#each overlay.modules.filter(v=>v.active) as module (module.uuid)}
			<article transition:fade style="--x: {module.box.x}px; --y: {module.box.y}px; --width: {module.box.width}px; --height: {module.box.height}px; --rad: {module.box.rotate}rad">
				{#if modulesState[module.moduleUUID] === 'done'}
					<ModuleWrapper this={modulesStore[module.moduleUUID].liveComponent} bind:settings={module.settings} bind:box={module.box} bind:live={module.live} bind:channel={modulesChannels[module.uuid]} assets={assets} />
					{#if !readiedModules[module.uuid]}
						{refreshModule(module.uuid)}
					{/if}
				{/if}
			</article>
		{/each}
	{:else}
		{#if !connected}
			connecting...
		{/if}
	{/if}
</main>

<style>
	main {
		position: relative;
		width: var(--width);
		height: var(--height);
	}
	article {
		position: absolute;
		left: var(--x);
		top: var(--y);
		width: var(--width);
		height: var(--height);
		transform: rotate(var(--rad));
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: minmax(0, 1fr);
		overflow: hidden;
	}
</style>
