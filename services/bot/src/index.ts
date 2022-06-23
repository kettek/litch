import SettingsComponent from './settings.svelte'
import en from '../locales/en.json'

export default {
	title: "Bot",
	defaults: {
		settings: {
			bots: [/*{
				enabled: false,
				prefix: '[BOT]',
				suffix: '',
				name: 'Gregory',
				channels: [],
				joinMessage: 'Gregory\'s bones are ready to rumble!',
				leaveMessage: 'Sayonara, suckers!',
			}*/],
		},
	},
	SettingsComponent: SettingsComponent,
	locales: {
		"en": en,
	}
}