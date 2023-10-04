export interface SettingsInterface {
	temporaries: Bouncer[]
	bouncers: Bouncer[]
	bouncerSpeed: number
	minBouncerWidth?: number
	minBouncerHeight?: number
	maxBouncerWidth?: number
	maxBouncerHeight?: number
}

export interface Bouncer {
	title?: string
	id?: string
	temporary?: boolean
	reference: {
		collection: string
		asset: string
		mimetype: string
		name: string
	}
}

export const defaultBouncer: Bouncer = {
	reference: {
		collection: '',
		asset: '',
		mimetype: '',
		name: '',
	}
}