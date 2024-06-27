import type { ModuleInterface } from '@kettek/litch-app/src/interfaces/Module'
import type { Settings } from './common'
import SettingsComponent from './settings.svelte'
import LiveComponent from './live.svelte'
import PreviewComponent from './preview.svelte'

export default {
	title: "YouTube Player",
	uuid: '00000000-0000-0000-0000-000000000001',
	defaults: {
		title: "yt",
		box: {
			x: 0, y: 0, width: 200, height: 200,
		},
		settings: {
			url: '',
			autoplay: false,
		},
	},
	settingsComponent: SettingsComponent,
	liveComponent: LiveComponent,
	previewComponent: PreviewComponent,
} satisfies ModuleInterface | {defaults: {settings: Settings}};