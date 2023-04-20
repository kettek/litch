import type { ModuleInterface } from '../interfaces/Module'
import { get, writable } from 'svelte/store'
import type { UUID } from '../api'

export const modules = (() => {
	let mods: Record<string, ModuleInterface> = {}
	const { subscribe, set, update } = writable(mods)

	return {
		subscribe,
		set,
		update,
		snag: (uuid: UUID) => {
			return get({subscribe})[uuid]
		}
	}
})()