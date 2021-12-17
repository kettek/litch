export interface SettingsInterface {
	imageRendering?: 'auto' | 'smooth' | 'high-quality' | 'crisp-edges' | 'pixelated',
	//
	emotions: Emotion[]
	//
	currentFace: string
	//
	sampleRate: number
	sampleLimit: number
	trigger: number
}

export interface Emotion {
	name: string
	faces: Faces
	open: boolean
}

export interface Faces {
	eyesOpenMouthOpen: ImageSource
	eyesOpenMouthClosed: ImageSource
	eyesClosedMouthOpen: ImageSource
	eyesClosedMouthClosed: ImageSource
}

export interface ImageSource {
	open: boolean
	reference: {
		collection: string
		asset: string
	}
}

export const renderTypes = ['auto', 'smooth', 'high-quality', 'crisp-edges', 'pixelated']
