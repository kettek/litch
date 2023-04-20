import SettingsComponent from './settings.svelte'
import LiveComponent from './live.svelte'
import PreviewComponent from './preview.svelte'
import InstanceComponent from './instance.svelte'
import PopupAction from './PopupAction.svelte'
import en from '../locales/en.json'

export default {
	title: "Alerts",
	uuid: '00000000-0000-0000-0000-000000000010',
	defaults: {
		title: "alerts",
		box: {
			x: 0, y: 0, width: 640, height: 360,
		},
		settings: {
			styles: [],
		},
	},
	triggerEvents: {
		actions: [
			{
				title: "Popup",
				id: "popup",
				ActionComponent: PopupAction,
			}
		]
	},
	settingsComponent: SettingsComponent,
	liveComponent: LiveComponent,
	previewComponent: PreviewComponent,
	instanceComponent: InstanceComponent,
	locales: {
		"en": en,
	}
}