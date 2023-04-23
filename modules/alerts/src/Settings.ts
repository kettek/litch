export interface SettingsInterface {
	example: string
	style: Style
}

export interface Style {
	size: string
	textColor: string
	outlineColor: string
	css: string
}

export const defaultStyle: Style = {
	size: '30pt',
	textColor: '#ffffff',
	outlineColor: '#000000',
	css: '',
}

export const defaultExample: string = '{Big John} donated {Big Things}'