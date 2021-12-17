import { localStore } from './localStore'

export const settings = localStore('settings', {
	port: 8090,
	collectionUUID: '',
	activeOverlay: '',
})