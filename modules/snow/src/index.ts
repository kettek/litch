import SettingsComponent from './settings.svelte'
import LiveComponent from './live.svelte'
import PreviewComponent from './preview.svelte'

export default {
	title: "Snow",
	uuid: '00000000-0000-0000-0000-000000000006',
	defaults: {
		title: "Snow",
		box: {
		x: 0, y: 0, width: 200, height: 200,
		},
		settings: {
			emoji: '❄',
			count: 30,
			updateRate: 50,
			maxAccumulator: 200,
			spawnX: 0,
			spawnY: -110,
			minScale: 0.5,
			scaleRandom: 1,
			size: 2,
			rotate: true,
			xRandomRate: [-0.25, 0.25],
			yRandomRate: [0.5, 1],
			rotRandomRate: [-2, 2],
		},
	},
	settingsComponent: SettingsComponent,
	liveComponent: LiveComponent,
	previewComponent: PreviewComponent,
}