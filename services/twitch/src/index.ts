import SettingsComponent from './settings.svelte'
import en from '../locales/en.json'

export default {
	title: "Twitch Integration",
	uuid: '00000000-0000-0000-0000-000000000001',
	defaults: {
		settings: {
		},
	},
	SettingsComponent: SettingsComponent,
	locales: {
		"en": en,
	}
}