import type { ServiceInterface } from '../interfaces/Service'
import { localStore } from "./localStore"
import { get } from 'svelte/store'

export function addService(s: ServiceInterface) {
	services.update((v: any) => {
		let existing = v.findIndex((v2: any) => v2.uuid === s.uuid)
		if (existing !== -1) {
			v[existing] = {
				...v[existing],
				...s,
			}
		} else {
			v.push(s)
		}
		return v
	})
}

export function removeService(uuid: string) {
	services.update((v: any) => v.filter((v2: any)=>v2.uuid===uuid)
	)
}

export function refreshServices() {
	services.set(get(services))
}

function deserializeServices() {
	// Remove duplicates.
	let ss = get(services)
	let ss2: ServiceInterface[] = []
	for (let s of ss) {
		if (ss2.find(v=>v.uuid!==s.uuid)) {
			ss2.push(s)
		}
	}

	// TODO: Add channel.
	services.set(ss2)
}

export const services = localStore<ServiceInterface[]>('services', [])

deserializeServices()