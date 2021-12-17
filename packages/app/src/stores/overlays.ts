import type { OverlayInterface } from '../interfaces/Overlay'
import { createModuleChannel } from '../modules'
import { localStore } from './localStore'

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
	overlays.update((v: any) => {
		let overlays: Record<string, OverlayInterface> = v as Record<string, OverlayInterface>
		for (let [uuid, overlay] of Object.entries(overlays)) {
			for (let m of overlay.modules) {
				m.channel = createModuleChannel(uuid, m.uuid)
			}
		}
		return v
	})
}

export function refreshOverlays() {
	overlays.update((v: any) => {
		console.log('called refreshOverlays')
		return v
	})
}

const initialOverlays: Record<string, OverlayInterface> = {}

export const overlays = localStore<Record<string, OverlayInterface>>('overlays', initialOverlays)

deserializeOverlays()