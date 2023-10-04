import type { ServiceInterface } from '../interfaces/Service'
import { localStore } from "./localStore"
import { get } from 'svelte/store'
import { createServiceChannel } from '../services'
import merge from 'ts-deepmerge'

export function addService(s: ServiceInterface) {
	services.update((v: any) => {
		let existing = v.findIndex((v2: any) => v2.uuid === s.uuid)
		if (existing !== -1) {

			v[existing] = {
				...v[existing],
				...s,
				settings: merge({...s.defaults.settings}, v[existing].settings),
				data: {},
			}
		} else {
			v.push({
				...s,
				settings: {...s.defaults.settings},
				channel: createServiceChannel(s.uuid),
				data: {},
			})
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
	let ss = get(services)
	setServices(ss)
}

export function setServices(ss: ServiceInterface[]) {
	for (let s of ss) {
		s.channel = createServiceChannel(s.uuid)
		s.data = {}
	}
	services.set(ss)
}

export const services = localStore<ServiceInterface[]>('services', [])

deserializeServices()