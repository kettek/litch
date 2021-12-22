import type { OverlayInterface } from '../interfaces/Overlay'
import { createModuleChannel } from '../modules'
import { localStore } from './localStore'
import { get } from 'svelte/store'
import { v4 } from 'uuid'

export function restoreOverlays() {

}

export function addOverlay(o: OverlayInterface) {
	overlays.update((v: any) => {
		v[o.uuid] = o
		return v
	})
}

export function removeOverlay(u: string) {
	overlays.update((v: any) => {
		delete v[u]
		return v
	})
}

export function deserializeOverlays() {
	let os = get(overlays) as Record<string, OverlayInterface>
	for (let [uuid, overlay] of Object.entries(os)) {
		for (let m of overlay.modules) {
			m.channel = createModuleChannel(uuid, m.uuid)
			// Reroll any module UUIDs that exist more than once.
			if (overlay.modules.filter(v=>v.uuid===uuid).length > 1) {
				console.log('duplicate module uuid found rerolling')
				m.uuid = v4()
			}
		}
	}
	overlays.set(os)
}

export function refreshOverlays() {
	overlays.set(get(overlays))
}

const initialOverlays: Record<string, OverlayInterface> = {}

export const overlays = localStore<Record<string, OverlayInterface>>('overlays', initialOverlays)

deserializeOverlays()