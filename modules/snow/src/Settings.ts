export interface SettingsInterface {
	sourceType: 'emoji' | 'asset'
	emoji: string
	reference: string
	count: number
	updateRate: number
	maxAccumulator: number
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
