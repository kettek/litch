export interface SettingsInterface {
	styles: Style[]
}

export interface Style {
	name: string
	focusColor: string
	textColor: string
	outlineColor: string
	css: string
}