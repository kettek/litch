export interface SettingsInterface {
	entries?: EntryInterface[]
	openEntries?: boolean
}

export const renderTypes = ['auto', 'smooth', 'high-quality', 'crisp-edges', 'pixelated']

export const fitTypes = ['fill', 'contain', 'scale-down', 'cover', 'none']

export interface EntryInterface {
	name?: string
	left: number
	top: number
	width?: number
	height?: number
	imageRendering?: 'auto' | 'smooth' | 'high-quality' | 'crisp-edges' | 'pixelated',
	sourceType?: 'asset' | 'url' | 'text' | 'iframe'
	source?: string
	scrollbars?: boolean
	reference?: AssetSourceInterface
	style?: string
}

export interface AssetSourceInterface {
	collection: string
	asset: string
	mimetype: string
	name: string
}