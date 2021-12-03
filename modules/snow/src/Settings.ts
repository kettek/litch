export interface SettingsInterface {
	source?: string
	imageRendering?: 'auto' | 'smooth' | 'high-quality' | 'crisp-edges' | 'pixelated',
	isLocal?: boolean,
	localSource?: string,
	refresher?: number,
	naturalWidth?: number,
	naturalHeight?: number,
	style?: string,
	//
	spawnRate?: number
	deathRate?: number
	despawnOffscreen?: boolean
	//
	groups: SpawnGroup[]
}

export type SpawnGroup = {
	disabled: boolean
	groupWeight: number
	spawnRate: number
	//
	source: string
	isLocal: boolean,
	localSource: string,
	//
	itemWidth: number
	itemHeight: number
	//
	items: SpawnItem[]
}

export type SpawnItem = {
	seed: number
	x: number
	y: number
	scale: number
	rotation: number
}

export const renderTypes = ['auto', 'smooth', 'high-quality', 'crisp-edges', 'pixelated']

export const fitTypes = ['fill', 'contain', 'scale-down', 'cover', 'none']