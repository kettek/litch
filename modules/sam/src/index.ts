import type { ModuleInterface } from '@kettek/litch-app/src/interfaces/Module'
import type { SettingsInterface } from './Settings'
import SettingsComponent from './settings.svelte'
import InstanceComponent from './instance.svelte'
import SayAction from './SayAction.svelte'
import en from '../locales/en.json'
import { defaultExample, defaultOptions } from './Settings'

export default {
	title: "SAM",
	uuid: '00000000-0000-0000-0000-000000000013',
	defaults: {
		title: "SAM",
		settings: {
			example: defaultExample,
			options: defaultOptions,
		},
	},
	triggerEvents: {
		actions: [
			{
				title: "Say",
				id: "say",
				ActionComponent: SayAction,
			}
		]
	},
	settingsComponent: SettingsComponent,
	instanceComponent: InstanceComponent,
	locales: {
		"en": en,
	}
} satisfies ModuleInterface | { defaults: { settings: SettingsInterface } };