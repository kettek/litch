import SettingsComponent from './settings.svelte'
import LiveComponent from './live.svelte'
import InstanceComponent from './instance.svelte'
import PreviewComponent from './preview.svelte'
import { defaultItem } from './SettingsI'
import en from '../locales/en.json'
import TossAction from './TossAction.svelte'

export default {
	title: "Tosser",
	uuid: '00000000-0000-0000-0000-000000000012',
	defaults: {
		title: "Tosser",
		box: {
		x: 0, y: 0, width: 200, height: 200,
		},
		settings: {
			updateRate: 16,
			maxAccumulator: 64,
			items: [JSON.parse(JSON.stringify(defaultItem))],
			gravity: [0, 0.1],
			spawnRangeX: [0, 200],
			spawnRangeY: [300, 300],
			spawnVelocity: [2, 4],
			spawnAngle: [-80, 80],
			lifetime: [200, 200],
		},
	},
	triggerEvents: {
		actions: [
			{
				title: "Toss",
				id: "toss",
				ActionComponent: TossAction,
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