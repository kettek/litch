import type { ModuleInterface } from '@kettek/litch-app/src/interfaces/Module'
import type { SettingsInterface } from './SettingsI'
import SettingsComponent from './settings.svelte'
import LiveComponent from './live.svelte'
import PreviewComponent from './preview.svelte'
import { defaultGroup } from './SettingsI'
import en from '../locales/en.json'

export default {
	title: "Fireworks",
	uuid: '00000000-0000-0000-0000-000000000008',
	defaults: {
		title: "Fireworks",
		box: {
			x: 0, y: 0, width: 200, height: 200,
		},
		settings: {
			updateRate: 50,
			maxAccumulator: 200,
			count: 10,
			groups: [JSON.parse(JSON.stringify(defaultGroup))],
		},
	},
	settingsComponent: SettingsComponent,
	liveComponent: LiveComponent,
	previewComponent: PreviewComponent,
	locales: {
		"en": en,
	}
} satisfies ModuleInterface | {defaults: {settings: SettingsInterface}};