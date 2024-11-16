import { SettingsInterface, defaultExample, defaultOptions } from "./Settings"

export function upgrade(settings: SettingsInterface): [boolean, SettingsInterface] {
	let changed = false

	if (!settings) {
		settings = {
			example: defaultExample,
			options: defaultOptions,
		}
		changed = true
	}
	if (!settings.options) {
		settings.options = defaultOptions
		changed = true
	} else {
		for (let [key, value] of Object.entries(defaultOptions)) {
			if (!settings[key]) {
				settings[key] = value
				changed = true
			}
		}
	}
	if (!settings.example) {
		settings.example = defaultExample
		changed = true
	}
	return [changed, settings]
}