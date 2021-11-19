<script lang="ts">
	import { onMount } from 'svelte'

	import ModuleWrapper from './ModuleWrapper.svelte'

	import { isHello, isLazyUpdate, isModuleTypeResponse, LitchMessage, ModuleTypeRequest } from '../../src/api'

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
						console.log(`hello ${msg.uuid}`)
					} else if (isLazyUpdate(msg)) {
						console.log('got Lazyupdate', msg)
						overlay = {
							...overlay,
							canvas: msg.box,
							modules: msg.modules,
							uuid: msg.overlayUUID,
						}
						checkOverlayModules()
					} else if (isModuleTypeResponse(msg)) {
						if (msg.file === '') {
							modulesStore[msg.uuid] = new Error('no module')
						} else {
							addModule(msg.uuid, msg.file)
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

	let modulesStore: Record<string, ModuleInterface|null|Error> = {} // null signifies pending, Error is when it fails.
	function checkOverlayModules() {
		for (let m of overlay.modules) {
			if (modulesStore[m.moduleUUID] === undefined) {
				// Request, as we have not yet heard of it.
				requestModule(m.moduleUUID)
			} else {
				// Either null or error, oh well.
			}
		}
	}
	function requestModule(uuid: string) {
		console.log('requested module', uuid)
		let m: ModuleTypeRequest = {
			event: 'module-request',
			uuid,
		}
		webSocket?.send(JSON.stringify(m))
	}
	async function addModule(uuid: string, path: string) {
		const url = `${path}`
		console.log('import', path)
		try {
			let m: ModuleInterface = (await import(url)).default as unknown as ModuleInterface
			modulesStore[uuid] = m
			console.log('added module', uuid, 'from', path, 'result', m)
		} catch(err: any) { // FIXME: Does await import failure have an error type?
			console.log('oops', err)
			modulesStore[uuid] = err
		}
	}
	function getModule(uuid: string): ModuleInterface | null {
		let m = modulesStore[uuid]
		if (m === null || m instanceof Error) {
			return null
		}
		return m
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
				{#if modulesStore[module.moduleUUID]}
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
		background: rgba(128, 128, 128, 0.5);
	}
</style>
