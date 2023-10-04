//import { defaultGroup, SettingsInterface } from "./SettingsI"
import type { SettingsInterface } from "./SettingsI"

export function upgrade(settings: any): [boolean, SettingsInterface] {
	let changed = false
	/*let keys = Object.keys(defaultGroup)
	if (Object.keys(settings).find((v)=>keys.includes(v))) {
		let group: any = {}
		for (let key of keys) {
			group[key] = settings[key] ?? defaultGroup[key]
			delete settings[key]
		}
		group = JSON.parse(JSON.stringify(group)) // FIXME: Replace with a clone function. This is to ensure deep values are not references.
		if (!settings.groups) settings.groups = []
		settings.groups.push(group)
		changed = true
	}
	if (!settings.groups) {
		settings.groups = []
		changed = true
	}
	if (!settings.teleport) {
		settings.teleport = {
			X: [-10, 110],
			Y: [-10, 110],
		}
	}*/
	return [changed, settings]
}