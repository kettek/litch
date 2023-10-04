import type { OverlayInterface } from '../interfaces/Overlay'
import { createModuleChannel, createModuleChannels } from '../modules'
import { localStore } from './localStore'
import { get } from 'svelte/store'
import { v4 } from 'uuid'
import { createServicesChannel } from '../services'

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

export function duplicateOverlay(u: string) {
	overlays.update((v: any) => {
		let clone = JSON.parse(JSON.stringify(v[u]))
		clone.uuid = v4()

		for (let m of clone.modules) {
			m.liveChannel = createModuleChannel(clone.uuid, m.uuid)
			m.settingsChannel = createModuleChannel(clone.uuid, m.uuid)
			m.previewChannel = createModuleChannel(clone.uuid, m.uuid)
			m.instanceChannel = createModuleChannel(clone.uuid, m.uuid)
			m.channels = createModuleChannels(clone.uuid, m.uuid)
			m.servicesChannel = createServicesChannel()
		}

		v[clone.uuid] = clone
		return v
	})
}

export function deserializeOverlays() {
	let os = get(overlays) as Record<string, OverlayInterface>
	setOverlays(os)
}

export function setOverlays(os: Record<string, OverlayInterface>) {
	for (let [uuid, overlay] of Object.entries(os)) {
		for (let m of overlay.modules) {
			m.liveChannel = createModuleChannel(uuid, m.uuid)
			m.settingsChannel = createModuleChannel(uuid, m.uuid)
			m.previewChannel = createModuleChannel(uuid, m.uuid)
			m.instanceChannel = createModuleChannel(uuid, m.uuid)
			m.channels = createModuleChannels(uuid, m.uuid)
			m.servicesChannel = createServicesChannel()
			// Reroll any module UUIDs that exist more than once.
			if (overlay.modules.filter(v=>v.uuid===m.uuid).length > 1) {
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