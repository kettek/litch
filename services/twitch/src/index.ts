import SettingsComponent from './settings.svelte'
import en from '../locales/en.json'

export default {
	title: "Twitch Integration",
	defaults: {
		settings: {
			clientID: '',
			chatBot: {
				enabled: false,
				prefix: '[BOT]',
				suffix: '',
				name: 'Gregory',
				channels: [],
				joinMessage: 'Gregory\'s bones are ready to rumble!',
				leaveMessage: 'Sayonara, suckers!',
			}
		},
	},
	SettingsComponent: SettingsComponent,
	locales: {
		"en": en,
	}
}