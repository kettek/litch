import SettingsComponent from './settings.svelte'
import LiveComponent from './live.svelte'
import InstanceComponent from './instance.svelte'
import PreviewComponent from './preview.svelte'
import en from '../locales/en.json'
import AddAction from './AddAction.svelte'
import ClearTempAction from './ClearTempAction.svelte'

export default {
	title: "Bouncer",
	uuid: '00000000-0000-0000-0000-000000000011',
	defaults: {
		title: "Bouncer",
		box: {
		x: 0, y: 0, width: 200, height: 200,
		},
		settings: {
			bouncers: [],
			bouncerSpeed: 10,
			jiggleTime: 60,
		},
	},
	triggerEvents: {
		actions: [
			{
				title: "Add Bouncer",
				id: "add",
				ActionComponent: AddAction,
			},
			{
				title: "Clear Temporaries",
				id: "clearTemp",
				ActionComponent: ClearTempAction,
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