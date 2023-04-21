import { SettingsInterface, defaultExample, defaultStyle } from "./Settings"

export function upgrade(settings: SettingsInterface): [boolean, SettingsInterface] {
	let changed = false
	
	if (!settings) {
		settings = {
			example: defaultExample,
			style: defaultStyle,
		}
		changed = true
	}
	if (!settings.style) {
		settings.style = defaultStyle
		changed = true
	} else {
		for (let [key, value] of Object.entries(defaultStyle)) {
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