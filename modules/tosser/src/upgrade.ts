import type { SettingsInterface } from "./SettingsI"

export function upgrade(settings: any): [boolean, SettingsInterface] {
	let changed = false
	
	if (settings.groups) {
		settings.items = settings.groups
		delete settings.groups
		changed = true
	}

	return [changed, settings]
}