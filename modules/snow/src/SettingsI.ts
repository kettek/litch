export interface SettingsInterface {
	groups: SpawnItem[]
	updateRate: number
	maxAccumulator: number
	teleport: {
		X: [number, number]
		Y: [number, number]
	}
}

export interface SpawnItem {
	sourceType: 'emoji' | 'asset'
	emoji: string
	reference: {
		collection: string
		asset: string
		mimetype: string
		name: string
	}
	count: number
	spawnX: number
	spawnY: number
	minScale: number
	scaleRandom: number
	size: number
	rotate: boolean
	xRandomRate: [number, number]
	yRandomRate: [number, number]
	rotRandomRate: [number, number]
}

export const defaultGroup: SpawnItem = {
	sourceType: 'emoji',
	emoji: '❄',
	reference: {
		collection: '',
		asset: '',
		mimetype: '',
		name: '',
	},
	count: 30,
	spawnX: 0,
	spawnY: -110,
	minScale: 0.5,
	scaleRandom: 1,
	size: 2,
	rotate: true,
	xRandomRate: [-0.25, 0.25],
	yRandomRate: [0.5, 1],
	rotRandomRate: [-2, 2],
}