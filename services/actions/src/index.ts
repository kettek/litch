import SettingsComponent from './settings.svelte'
import en from '../locales/en.json'

export default {
	title: "Actions",
	defaults: {
		settings: {
		},
	},
	SettingsComponent: SettingsComponent,
	locales: {
		"en": en,
	}
}