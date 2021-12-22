import { defaultGroup, SettingsInterface } from "./SettingsI"

export function upgrade(settings: any): [boolean, SettingsInterface] {
	let changed = false
	// Check if the settings are from pre-groups and upgrade it.
	let keys = Object.keys(defaultGroup)
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
	return [changed, settings]
}