<script lang='ts'>
  import { onMount } from "svelte";
  import { publisher } from "./modules"

	import { actions } from "./stores/actions"
  import { getAsset } from "./assets";
  import { isTriggerCore, isTriggerCoreSound, isTriggerCoreToggleModule, isTriggerCoreWait } from "./interfaces/Action";
  import { overlays, refreshOverlays } from "./stores/overlays"

	async function triggerAction(uuid: string) {
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
				}
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

	onMount(() => {
		let subs = [
			publisher.subscribe('actions.*.trigger', async (msg) => {
				let uuid = msg.sourceTopic?.split('.')[1]
				triggerAction(uuid as string)
			}),
		]
		return () => {
			for (let sub of subs) {
				publisher.unsubscribe(sub)
			}
		}
	})
</script>