import SettingsComponent from './settings.svelte'
import LiveComponent from './live.svelte'
import PreviewComponent from './preview.svelte'
import InstanceComponent from './instance.svelte'
import en from '../locales/en.json'

export default {
	title: "Static Assets",
	uuid: '00000000-0000-0000-0000-000000000009',
	defaults: {
		title: "static assets",
		box: {
			x: 0, y: 0, width: 640, height: 360,
		},
		settings: {
			openEntries: true,
			entries: [],
		},
	},
	settingsComponent: SettingsComponent,
	liveComponent: LiveComponent,
	previewComponent: PreviewComponent,
	instanceComponent: InstanceComponent,
	locales: {
		"en": en,
	}
}