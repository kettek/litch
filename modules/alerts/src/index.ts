import type { ModuleInterface } from '@kettek/litch-app/src/interfaces/Module'
import type { SettingsInterface } from './Settings'
import SettingsComponent from './settings.svelte'
import LiveComponent from './live.svelte'
import PreviewComponent from './preview.svelte'
import InstanceComponent from './instance.svelte'
import PopupAction from './PopupAction.svelte'
import en from '../locales/en.json'
import { defaultExample, defaultStyle } from './Settings'

export default {
	title: "Alerts",
	uuid: '00000000-0000-0000-0000-000000000010',
	defaults: {
		title: "alerts",
		box: {
			x: 0, y: 0, width: 640, height: 360,
		},
		settings: {
			example: defaultExample,
			style: defaultStyle,
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
} satisfies ModuleInterface | {defaults: {settings: SettingsInterface}};