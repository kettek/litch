export interface SettingsInterface {
	groups: SpawnGroup[]
	count: number
	updateRate: number
	maxAccumulator: number
}

export interface SpawnGroup {
	rocket: SpawnItem
	payload: SpawnItem[]
	count: number
	launchRateMin: number
	launchRateMax: number
	explosionDelayMin: number
	explosionDelayMax: number
}

export interface SpawnItem {
	sourceType: 'emoji' | 'asset' | 'particle'
	emoji: string
	color: string
	reference: {
		collection: string
		asset: string
		mimetype: string
		name: string
	}
	size: number
	force: number
	countMin?: number
	countMax?: number
	lifetimeMin?: number
	lifetimeMax?: number
	weightMin?: number
	weightMax?: number
	offsetX?: number
	offsetY?: number
}

export const defaultRocket: SpawnItem = {
	sourceType: 'emoji',
	emoji: '💮',
	color: '#ff0000',
	reference: {
		collection: '',
		asset: '',
		mimetype: '',
		name: '',
	},
	size: 2,
	force: 1,
	offsetX: 0,
	offsetY: 0,
}

export const defaultPayload: SpawnItem = {
	sourceType: 'emoji',
	emoji: '✨',
	color: '#ffaabb',
	reference: {
		collection: '',
		asset: '',
		mimetype: '',
		name: '',
	},
	size: 2,
	force: 1,
	countMin: 10,
	countMax: 20,
	lifetimeMin: 900,
	lifetimeMax: 1100,
	weightMin: 1,
	weightMax: 2,
	offsetX: 0,
	offsetY: 0,
}

export const defaultGroup: SpawnGroup = {
	rocket: defaultRocket,
	payload: [defaultPayload],
	count: 10,
	launchRateMin: 500,
	launchRateMax: 8000,
	explosionDelayMin: 3000,
	explosionDelayMax: 4000,
}