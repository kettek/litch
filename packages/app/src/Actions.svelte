<script lang='ts'>
  import { onMount } from "svelte";
  import { publisher } from "./modules"

	import { actions } from "./stores/actions"
  import { getAsset } from "./assets";
  import { ActionCoreHotkeyI, ActionTriggerModuleI, isActionCoreHotkey, isTriggerCore, isTriggerCoreSound, isTriggerCoreToggleModule, isTriggerCoreTriggerModule, isTriggerCoreWait, isTriggerModule } from "./interfaces/Action";
  import { overlays, refreshOverlays } from "./stores/overlays"
  import { modules } from "./stores/modules"
  import type { PublishedMessage } from "@kettek/pubsub/dist/Subscriber"

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
					if (!module) return
					if (trigger.data.act === 'enable') {
						module.active = true
					} else if (trigger.data.act === 'disable') {
						module.active = false
					}
					refreshOverlays()
				} else if (isTriggerCoreTriggerModule(trigger.data)) {
					let moduleUUID = trigger.data.module
					let overlay = $overlays[trigger.data.overlay]
					if (!overlay) continue
					let module = overlay.modules.find(v=>v.uuid===moduleUUID)
					if (!module) return
					let realModule = $modules[module.moduleUUID]
					if (!realModule) return
					console.log('publish', trigger.data.id, msg)
					module.instanceChannel.publish('trigger.'+trigger.data.id, msg)
				}
			} else if (isTriggerModule(trigger)) {
				let overlay = $overlays[trigger.overlayUUID]
				if (!overlay) continue
				let module = overlay.modules.find(v=>v.uuid===(trigger as ActionTriggerModuleI).moduleInstanceUUID)
				if (!module) return
				module.instanceChannel.publish('trigger.'+trigger.triggerID, {
					trigger: trigger.data,
					action: msg,
				})
			}
		}
	}

	function wait(duration: number) {
		return new Promise((resolve: (value: void) => void, reject: (reason: any) => void) => {
			setTimeout(() => {
				resolve()
			}, duration*1000)
		})
	}

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
	
	let previousHotKeys: string[] = []
	let hotkeyActions: ActionCoreHotkeyI[]
	$: hotkeyActions = $actions.filter(v=>isActionCoreHotkey(v)&&v.keys!=='') as ActionCoreHotkeyI[]
	$: {
		for (let action of hotkeyActions) {
			if (!previousHotKeys.includes(action.keys)) {
				publisher.publish(`hotkeys.${action.keys}.register`, {})
			}
		}
		for (let hotkey of previousHotKeys) {
			let has = false
			for (let action of hotkeyActions) {
				if (action.keys === hotkey) {
					has = true
					break
				}
			}
			if (!has) {
				publisher.publish(`hotkeys.${hotkey}.unregister`, {})
			}
		}
		previousHotKeys = hotkeyActions.map(v=>v.keys)
	}

	onMount(() => {
		let subs = [
			publisher.subscribe('actions.*.trigger', async (msg) => {
				let uuid = msg.sourceTopic?.split('.')[1]
				triggerAction(uuid as string, msg.message)
			}),
			publisher.subscribe('hotkeys.*.trigger', async (msg) => {
				let hotkey = msg.sourceTopic?.split('.')[1]
				for (let action of hotkeyActions) {
					if (action.keys === hotkey) {
						triggerAction(action.uuid, msg.message)
					}
				}
			})
		]

		// Register hotkeys
		for (let action of $actions) {
			if (isActionCoreHotkey(action)) {
				publisher.publish(`hotkeys.${action.keys}.register`, {})
			}
		}

		return () => {
			for (let sub of subs) {
				publisher.unsubscribe(sub)
			}
		}
	})
</script>