import { localStore } from './localStore'

export function setSettings(s: any) {
	settings.set(s)
}

export const settings = localStore('settings', {
	port: 8090,
	collectionUUID: '',
	activeOverlay: '',
})