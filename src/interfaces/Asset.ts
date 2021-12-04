
export interface Asset {
	/**
	 * End-user defined name
	 */
	name: string
	uuid: string
	mimetype: string
	tags: string[] // probably easy enough just to use tags?
	/**
	 * Original source path, should be a local file.
	 */
	originalSource: string
	/**
	 * Redirected source path, for serving.
	 */
	redirectedSource: string
	/**
	 * Goofy refresher used to forcibly bypass browser caching.
	 */
	refresher: number
	//
}