export interface SettingsInterface {
	items: SpawnItem[]
	updateRate: number
	maxAccumulator: number
	gravity: [number, number]
	spawnRangeX: [number, number]
	spawnRangeY: [number, number]
	spawnVelocity: [number, number]
	spawnAngle: [number, number]
	lifetime: [number, number]
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
	scale: [number, number]
}

export const defaultItem: SpawnItem = {
	sourceType: 'emoji',
	emoji: '🐦',
	reference: {
		collection: '',
		asset: '',
		mimetype: '',
		name: '',
	},
	scale: [1, 1],
}