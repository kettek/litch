export interface SettingsInterface {
	example: string
	style: Style
}

export interface Style {
	size: string
	textColor: string
	outlineColor: string
	outline: boolean
	css: string
}

export const defaultStyle: Style = {
	size: '30pt',
	textColor: '#ffffff',
	outlineColor: '#000000',
	outline: true,
	css: '',
}

export const defaultExample: string = '{Big John}.rainbow {donated}#purple {Big Things}.wiggle#pink'