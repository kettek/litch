import type { ModuleInterface } from '@kettek/litch-app/src/interfaces/Module'
import type { SettingsInterface } from './Settings'
import VLCStatusCondition from './VLCStatusCondition.svelte'
import en from '../locales/en.json'
import Action from './Action.svelte'

export default {
	title: "VLC Integration",
	uuid: '00000000-0000-0000-0000-000000000009',
	defaults: {
		settings: {
			address: "http://127.0.0.1:8080",
			password: "",
		},
	},
	actionComponent: Action,
	actionEvents: {
		conditions: [
			{
				title: "VLC Status",
				id: "vlc-status",
				ConditionComponent: VLCStatusCondition,
				payload: {
					"filename": "filename",
					"date": "date",
					"title": "title",
					"genre": "genre",
					"artist": "artist",
					"album": "album",
					"artworkURL": "artworkURL",
					"status": "status",
				},
			},	
		],
	},
	locales: {
		"en": en,
	}
} satisfies ModuleInterface | {defaults: {settings: SettingsInterface}};