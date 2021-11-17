import SettingsComponent from './settings.svelte'
import InstanceComponent from './instance.svelte'
import ItemComponent from './item.svelte'

export default {
	title: "Dummy Module",
	uuid: '00000000-0000-0000-0000-000000000000',
	defaults: {
		title: "A dummy module",
		box: {
		x: 0, y: 0, width: 200, height: 200,
		},
		settings: {},
	},
	settingsComponent: SettingsComponent,
	instanceComponent: InstanceComponent,
	itemComponent: ItemComponent,
}