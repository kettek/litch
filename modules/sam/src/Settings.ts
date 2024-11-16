export interface SettingsInterface {
	example: string
	options: Options
}

export interface Options {
	phonetic: boolean
	singmode: boolean
	volume: number
	pitch: number
	speed: number
	mouth: number
	throat: number
}

export const defaultOptions: Options = {
	phonetic: false,
	singmode: false,
	volume: 1.0,
	pitch: 64,
	speed: 72,
	mouth: 128,
	throat: 128
}

export const defaultExample: string = 'SAM I am'