export interface SettingsInterface {
	imageRendering?: 'auto' | 'smooth' | 'high-quality' | 'crisp-edges' | 'pixelated',
	//
	currentFace: string
	//
	tuber: LitchTuber|PuppeteerTuber
	//
	sampleRate: number
	sampleLimit: number
	trigger: number
}

export interface LitchTuber {
	type: 'litch'
	masks: LitchMask[]
}
export function isLitchTuber(object: any): object is LitchTuber {
	return object.type === 'litch'
}

export interface PuppeteerTuber {
	type: 'puppeteer'
	emotions: PuppeteerMask[]
}
export function isPuppeteerTuber(object: any): object is PuppeteerTuber {
	return object.type === 'puppeteer'
}

export interface LitchMask {
	name: string
	faces: Faces
	open: boolean
}

export interface PuppeteerMask {
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
		mimetype: string
		name: string
	}
}

export const renderTypes = ['auto', 'smooth', 'high-quality', 'crisp-edges', 'pixelated']
