import type { ServiceInterface } from '../interfaces/Service'
import { localStore } from "./localStore"
import { get } from 'svelte/store'

export const services = localStore<ServiceInterface[]>('services', [])