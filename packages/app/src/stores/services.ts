import type { ServiceInterface } from '../interfaces/Service'
import { localStore } from "./localStore"
import { get } from 'svelte/store'

export function addService(s: ServiceInterface) {
	services.update((v: any) => {
		v.push(s)
		return v
	})
}

export function removeService(uuid: string) {
	services.update((v: any) => v.filter((v2: any)=>v2.uuid===uuid)
	)
}

export const services = localStore<ServiceInterface[]>('services', [])