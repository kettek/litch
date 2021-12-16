import { writable } from 'svelte/store'

export const settings = writable({
	port: 8090,
	collectionUUID: '',
})