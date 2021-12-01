import SettingsComponent from './settings.svelte'
import LiveComponent from './live.svelte'
import PreviewComponent from './preview.svelte'

export default {
	title: "Media Embed",
	uuid: '00000000-0000-0000-0000-000000000005',
	defaults: {
		title: "media",
		box: {
		x: 0, y: 0, width: 640, height: 360,
		},
		settings: {
			imageRendering: 'auto',
			objectFit: 'contain',
			objectPosition: 'top left',
			mimetype: '',
			refresher: 0,
			naturalWidth: 0,
			naturalHeight: 0,
			style: '',
		},
	},
	settingsComponent: SettingsComponent,
	liveComponent: LiveComponent,
	previewComponent: PreviewComponent,
}