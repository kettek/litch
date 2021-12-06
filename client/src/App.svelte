<script lang="ts">
	import { onMount } from 'svelte'

	import ModuleWrapper from './ModuleWrapper.svelte'

	import { isHello, isLazyUpdate, isModuleTypeResponse, isEndpoint, LitchMessage, ModuleTypeRequest } from '../../src/api'

	import type { OverlayInterface } from '../../src/interfaces/Overlay'
	import type { ModuleInterface } from '../../src/interfaces/Module'

	let webSocket: WebSocket | undefined
	let connected: boolean = false
	let backoff: number = 100
	let uuid: string = ''

	let overlay: OverlayInterface = {
		title: '',
		uuid: '',
		canvas: {x: 0, y: 0, width: 0, height: 0},
		modules: [],
	}

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
					} else if (isLazyUpdate(msg)) {
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
						// FIXME: Super hacky
						let matchIndex = -1
						let matchModule = ''
						for (let m of overlay.modules) {
							let i = msg.data.topic.indexOf(m.uuid)
							if (i >= 0) {
								matchIndex = i
								matchModule = m.uuid
								break
							}
						}
						if (matchIndex >= 0) {
							//console.log('parse it !!!')
						}
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

	let modulesStore: Record<string, ModuleInterface> = {} // null signifies pending, Error is when it fails.
	let modulesState: Record<string, 'requesting'|'done'|'missing'|'error'> = {}
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
	{#if connected}
		{#each overlay.modules as module (module.uuid)}
			<article style="--x: {module.box.x}px; --y: {module.box.y}px; --width: {module.box.width}px; --height: {module.box.height}px">
				{#if modulesState[module.moduleUUID] === 'done'}
					<ModuleWrapper this={modulesStore[module.moduleUUID].liveComponent} bind:settings={module.settings} bind:box={module.box} />
				{/if}
			</article>
		{/each}
	{:else}
		connecting...
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
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: minmax(0, 1fr);
		overflow: hidden;
	}
</style>
