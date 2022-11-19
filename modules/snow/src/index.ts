import SettingsComponent from './settings.svelte'
import LiveComponent from './live.svelte'
import PreviewComponent from './preview.svelte'
import { defaultGroup } from './SettingsI'
import en from '../locales/en.json'

export default {
	title: "Snow",
	uuid: '00000000-0000-0000-0000-000000000006',
	defaults: {
		title: "Snow",
		box: {
		x: 0, y: 0, width: 200, height: 200,
		},
		settings: {
			updateRate: 50,
			maxAccumulator: 200,
			groups: [JSON.parse(JSON.stringify(defaultGroup))],
			teleport: {
				X: [-10, 110],
				Y: [-10, 110],
			}
		},
	},
	settingsComponent: SettingsComponent,
	liveComponent: LiveComponent,
	previewComponent: PreviewComponent,
	locales: {
		"en": en,
	}
}