import SettingsComponent from './settings.svelte'
import en from '../locales/en.json'

export default {
	title: "Twitch Integration",
	defaults: {
		settings: {
		},
	},
	SettingsComponent: SettingsComponent,
	locales: {
		"en": en,
	}
}