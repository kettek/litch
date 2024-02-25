<script lang='ts'>
  import { onMount } from "svelte";
  import { publisher } from "./modules"

	import { actions } from "./stores/actions"
  import { getAsset } from "./assets";
  import { ActionCoreHotkeyI, ActionTriggerModuleI, isActionCoreHotkey, isTriggerCore, isTriggerCoreSound, isTriggerCoreStoreModule, isTriggerCoreStoreOverlay, isTriggerCoreToggleModule, isTriggerCoreWait, isTriggerModule } from "./interfaces/Action";
  import { overlays, refreshOverlays } from "./stores/overlays"
  import { modules } from "./stores/modules"
  import type { PublishedMessage } from "@kettek/pubsub/dist/Subscriber"
	
	type ModuleStates = Record<string, {
		settings: any
		active: boolean
	}>
	
	type ModuleState = {
		settings: any
		active: boolean
	}

	const overlayStates: Record<string, ModuleStates[]> = {}
	const moduleStates: Record<string, ModuleState[]> = {}
	
	function storeModule(overlayUUID: string, moduleUUID: string): boolean {
		let overlay = $overlays[overlayUUID]
		if (!overlay) return false
		let module = overlay.modules.find(v=>v.uuid===moduleUUID)
		if (!module) return false
		if (!moduleStates[overlayUUID+moduleUUID]) {
			moduleStates[overlayUUID+moduleUUID] = []
		}
		moduleStates[overlayUUID+moduleUUID].push({
			settings: JSON.parse(JSON.stringify(module.settings)) || {},
			active: module.active,
		})
		return true
	}
	function restoreModule(overlayUUID: string, moduleUUID: string) {
		let overlay = $overlays[overlayUUID]
		if (!overlay) return false
		let module = overlay.modules.find(v=>v.uuid===moduleUUID)
		if (!module) return false
		if (!moduleStates[overlayUUID+moduleUUID]) {
			return false
		}
		const m = moduleStates[overlayUUID+moduleUUID].pop()
		if (m) {
			module.settings = JSON.parse(JSON.stringify(m))
			module.active = m.active
		}
		if (moduleStates[overlayUUID+moduleUUID].length === 0) {
			delete moduleStates[overlayUUID+moduleUUID]
		}
		return true
	}
	
	function storeOverlay(overlayUUID: string): boolean {
		let overlay = $overlays[overlayUUID]
		if (!overlay) return false
		if (!overlayStates[overlayUUID]) {
			overlayStates[overlayUUID] = []
		}
		let modules: ModuleStates = {}
		for (let module of overlay.modules) {
			modules[module.uuid] = {
				settings: JSON.parse(JSON.stringify(module.settings)),
				active: module.active,
			}
		}
		overlayStates[overlayUUID].push(modules)
		return true
	}
	
	function restoreOverlay(overlayUUID: string): boolean {
		let overlay = $overlays[overlayUUID]
		if (!overlay) return false
		if (!overlayStates[overlayUUID]) {
			return false
		}
		let modules = overlayStates[overlayUUID].pop()
		if (!modules) {
			return false
		}
		for (let [moduleUUID, state] of Object.entries(modules)) {
			let module = overlay.modules.find(v=>v.uuid===moduleUUID)
			if (!module) continue
			module.settings = JSON.parse(JSON.stringify(state.settings))
			module.active = state.active
		}
		if (overlayStates[overlayUUID].length === 0) {
			delete overlayStates[overlayUUID]
		}
		return true
	}

	// Triggers an action based upon its UUID.
	async function triggerAction(uuid: string, msg: PublishedMessage) {
		let action = $actions.find(v=>v.uuid===uuid)
		if (!action) return

		for (let trigger of action.triggers) {
			if (isTriggerCore(trigger)) {
				if (isTriggerCoreSound(trigger.data)) {
					await playSound(trigger.data.collection, trigger.data.asset, trigger.data.volume, trigger.data.wait)
				} else if (isTriggerCoreWait(trigger.data)) {
					await wait(trigger.data.seconds)
				} else if (isTriggerCoreToggleModule(trigger.data)) {
					let moduleUUID = trigger.data.module
					let overlay = $overlays[trigger.data.overlay]
					if (!overlay) continue
					let module = overlay.modules.find(v=>v.uuid===moduleUUID)
					if (!module) continue
					if (trigger.data.act === 'enable') {
						module.active = true
					} else if (trigger.data.act === 'disable') {
						module.active = false
					}
					refreshOverlays()
				} else if (isTriggerCoreStoreModule(trigger.data)) {
					await wait(0) // This is a hack to make sure the overlay is updated before we store the module state.
					let moduleUUID = trigger.data.module
					let overlay = $overlays[trigger.data.overlay]
					if (!overlay) continue
					let module = overlay.modules.find(v=>v.uuid===moduleUUID)
					if (!module) continue
					
					if (trigger.data.act === 'store') {
						storeModule(trigger.data.overlay, moduleUUID)
						continue
					} else {
						if (!restoreModule(trigger.data.overlay, moduleUUID)) {
							continue
						}
					}
					// TODO: Add a global "refreshModule(overlay, module) function"
					refreshOverlays()
					try {
						await module.channels.publish('update', module.settings)
					} catch(e: any) {
						if (e.errors) {
							for (let err of e.errors) {
								console.error(err)
							}
						} else {
							console.error(e)
						}
					}
				} else if (isTriggerCoreStoreOverlay(trigger.data)) {
					await wait(0) // This is a hack to make sure the overlay is updated before we store the module state.
					let overlay = $overlays[trigger.data.overlay]
					if (!overlay) continue
					if (trigger.data.act === 'store') {
						storeOverlay(trigger.data.overlay)
						continue
					} else {
						if (!restoreOverlay(trigger.data.overlay)) {
							continue
						}
					}
					refreshOverlays()
					for (let module of overlay.modules) {
						try {
							await module.channels.publish('update', module.settings)
						} catch(e: any) {
							if (e.errors) {
								for (let err of e.errors) {
									console.error(err)
								}
							} else {
								console.error(e)
							}
						}
					}
				}
			} else if (isTriggerModule(trigger)) {
				let overlay = $overlays[trigger.overlayUUID]
				if (!overlay) continue
				let module = overlay.modules.find(v=>v.uuid===(trigger as ActionTriggerModuleI).moduleInstanceUUID)
				if (!module) continue
				module.instanceChannel.publish('trigger.'+trigger.triggerID, {
					trigger: trigger.data,
					action: msg,
				})
			}
		}
	}

	// Waits for an amount of time before resolving. This is used to chain actions.
	function wait(duration: number) {
		return new Promise((resolve: (value: void) => void, reject: (reason: any) => void) => {
			setTimeout(() => {
				resolve()
			}, duration*1000)
		})
	}

	// Plays an asset sound and optionally waits for it to finish before resolving.
	function playSound(collection: string, asset: string, volume: number, wait: boolean = false) {
		return new Promise((resolve: (value: void) => void, reject: (reason: any) => void) => {
			let soundAsset = getAsset(collection, asset)
			if (!soundAsset) {
				reject('no sound')
				return
			}
			let url = soundAsset.redirectedSource || soundAsset.originalSource

			let audio = new Audio()
			audio.volume = volume
			audio.oncanplaythrough = () => {
				audio.play()
			}
			audio.onended = () => {
				resolve()
			}
			audio.src = url
			if (!wait) {
				resolve()
			}
		})
	}
	
	let previousHotKeys: ActionCoreHotkeyI[] = []
	let hotkeyActions: ActionCoreHotkeyI[]
	$: hotkeyActions = $actions.filter(v=>isActionCoreHotkey(v)&&v.keys!=='') as ActionCoreHotkeyI[]
	$: {
		for (let action of hotkeyActions) {
			if (!previousHotKeys.find(v=>action.keys===v.keys&&action.local===v.local)) {
				publisher.publish(`hotkeys.${action.local?'local':'global'}.${action.keys}.register`, {})
			}
		}
		for (let hotkey of previousHotKeys) {
			if (!hotkeyActions.find(v=>v.keys===hotkey.keys&&v.local===hotkey.local)) {
				publisher.publish(`hotkeys.${hotkey.local}.${hotkey.keys}.unregister`, {})
			}
		}
		previousHotKeys = [...hotkeyActions]
	}

	const mods = ['control', 'command', 'option', 'shift', 'alt', 'altgr', 'super', 'meta']
	let pressedKeys: string[] = []
	let keys: string[] = []
	function handleKeyDown(e: KeyboardEvent) {
		// Bypassing an ancient bug in Chrome where alt+shift generates meta. See https://bugs.chromium.org/p/chromium/issues/detail?id=1020141
		let key = e.key
		if (e.key === 'Meta' && e.code.startsWith('Alt')) {
			key = 'Alt'
		}
		if (pressedKeys.find(v=>v===key||v===key.toLocaleLowerCase()||v===key.toLocaleUpperCase())) return
		keys = [...keys, key.toLocaleLowerCase()]
		pressedKeys = [...pressedKeys, key.toLocaleLowerCase()].sort((a,b) => {
			let isModA = mods.includes(a)
			let isModB = mods.includes(b)
			if (isModA && !isModB) {
				return -1
			} else if (!isModA && isModB) {
				return 1
			} else if (isModA && isModB) {
				return mods.indexOf(a) - mods.indexOf(b)
			}
			return 0
		})
		let hotkey = hotkeyActions.find(v=>v.keys===pressedKeys.join('+'))
		if (hotkey) {
			publisher.publish(`hotkeys.${hotkey.local?'local':'global'}.${hotkey.keys}.trigger`, {})
		}
	}
	function handleKeyUp(e: KeyboardEvent) {
		// Bypassing an ancient bug in Chrome where alt+shift generates meta. See https://bugs.chromium.org/p/chromium/issues/detail?id=1020141
		let key = e.key
		if (e.key === 'Meta' && e.code.startsWith('Alt')) {
			key = 'Alt'
		}
		keys = keys.filter(v=>v!==key.toLocaleLowerCase())
		if (keys.length === 0) {
			pressedKeys = []
		}
	}

	onMount(() => {
		let subs = [
			publisher.subscribe('actions.*.trigger', async (msg) => {
				let uuid = msg.sourceTopic?.split('.')[1]
				triggerAction(uuid as string, msg.message)
			}),
			publisher.subscribe('hotkeys.*.*.trigger', async (msg) => {
				let hotkey = msg.sourceTopic?.split('.')[2]
				for (let action of hotkeyActions) {
					if (action.keys === hotkey) {
						triggerAction(action.uuid, msg.message)
					}
				}
			}),
			publisher.subscribe('hotkeys.local.*.register', async (msg) => {
				let keys = msg.sourceTopic?.split('.')[2]
			}),
			publisher.subscribe('hotkeys.local.*.unregister', async (msg) => {
				let keys = msg.sourceTopic?.split('.')[2]
			})
		]

		// Register hotkeys
		for (let action of $actions) {
			if (isActionCoreHotkey(action)) {
				publisher.publish(`hotkeys.${action.local?'local':'global'}.${action.keys}.register`, {})
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		window.addEventListener('keyup', handleKeyUp)
		let blurHandler = () => {
			keys = []
			pressedKeys = []
		}
		window.addEventListener('blur', blurHandler)

		return () => {
			window.removeEventListener('blur', blurHandler)
			window.removeEventListener('keydown', handleKeyDown)
			window.removeEventListener('keyup', handleKeyUp)
			for (let sub of subs) {
				publisher.unsubscribe(sub)
			}
		}
	})
</script>