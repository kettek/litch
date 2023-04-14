// localStore.ts
import { writable } from 'svelte/store'
import type { OverlayInterface } from '../interfaces/Overlay'
import type { ServiceInterface } from '../interfaces/Service'
import type { Collection } from '../interfaces/Asset'
import type { ActionInterface } from '../interfaces/Action'

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue } | Record<string, OverlayInterface> | Collection[] | ServiceInterface[] | ActionInterface[]

export const localStore = <T extends JsonValue>(key: string, initial: T) => {
	const toString = (value: T) => JSON.stringify(value, null, 2)
	const toObj = JSON.parse

	if (localStorage.getItem(key) === null) {
		localStorage.setItem(key, toString(initial))
	}

	navigator.storage.persist()

	const saved = toObj(window.localStorage.getItem(key))

	const { subscribe, set, update } = writable<T>(saved)

	return {
		subscribe,
		set: (value: T) => {
			localStorage.setItem(key, toString(value))
			return set(value)
		},
		update
	}
}
