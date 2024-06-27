import type { ModuleInterface } from '@kettek/litch-app/src/interfaces/Module'
import type { SettingsInterface } from './SettingsI'
import SettingsComponent from './settings.svelte'
import LiveComponent from './live.svelte'
import PreviewComponent from './preview.svelte'
import en from '../locales/en.json'

export default {
	title: "Dummy Module",
	uuid: '00000000-0000-0000-0000-000000000000',
	defaults: {
		title: "A dummy module",
		box: {
			x: 0, y: 0, width: 200, height: 200,
		},
		settings: {
			message: "Dummy!",
		},
	},
	settingsComponent: SettingsComponent,
	liveComponent: LiveComponent,
	previewComponent: PreviewComponent,
	locales: {
		"en": en,
	}
} satisfies ModuleInterface | {defaults: {settings: SettingsInterface}};