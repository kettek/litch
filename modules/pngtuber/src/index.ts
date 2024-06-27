import SettingsComponent from './settings.svelte'
import LiveComponent from './live.svelte'
import PreviewComponent from './preview.svelte'
import InstanceComponent from './instance.svelte'
import MuteAction from './MuteAction.svelte'
import en from '../locales/en.json'

export default {
	title: "PNGTuber",
	uuid: '00000000-0000-0000-0000-000000000007',
	defaults: {
		title: "PNG Tuber",
		box: {
		x: 0, y: 0, width: 200, height: 200,
		},
		settings: {
			imageRendering: 'auto',
			tuber: {
				type: 'litch',
				masks: [
					{
						name: 'idle',
						tags: {
							'eyes': true,
							'mouth': false,
						},
						frames: [],
					},
					{
						name: 'talk',
						tags: {
							'eyes': true,
							'mouth': true,
						},
						frames: [],
					}
				],
				framerate: 100,
			},
			sampleRate: 10,
			sampleLimit: 2,
			trigger: 32,
			muted: false,
		},
		live: {
			reference: {
				collection: '',
				asset: '',
			},
		},
	},
	eventTriggers: {
		actions: [
			{
				title: "Mute",
				id: "mute",
				ActionComponent: MuteAction,
			}
		]
	},
	settingsComponent: SettingsComponent,
	liveComponent: LiveComponent,
	previewComponent: PreviewComponent,
	instanceComponent: InstanceComponent,
	locales: {
		"en": en,
	}
}