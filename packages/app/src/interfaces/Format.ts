export interface FormatMessageObject {
	id?: string
	locale?: string
	format?: string
	default?: string
	values?: Record<string, string | number | Date>
}

export type Format = (messageId: string, options?: FormatMessageObject) => string