import SettingsComponent from './settings.svelte'
import LiveComponent from './live.svelte'
import PreviewComponent from './preview.svelte'
import { defaultGroup } from './SettingsI'

export default {
	title: "Snow",
	uuid: '00000000-0000-0000-0000-000000000006',
	defaults: {
		title: "Snow",
		box: {
		x: 0, y: 0, width: 200, height: 200,
		},
		settings: {
			groups: [JSON.parse(JSON.stringify(defaultGroup))]
		},
	},
	settingsComponent: SettingsComponent,
	liveComponent: LiveComponent,
	previewComponent: PreviewComponent,
}