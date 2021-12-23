import type { SettingsInterface } from "./Settings"

export function upgrade(settings: any): [boolean, SettingsInterface] {
	let changed = false
	// Upgrade from first version puppeteer-only type to multi-type.
	if (settings.emotions) {
		settings.tuber = {
			emotions: settings.emotions,
			type: 'puppeteer',
		}
		delete settings['emotions']
		changed = true
	}
	return [changed, settings]
}