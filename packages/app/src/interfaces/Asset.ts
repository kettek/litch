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

export interface Collection {
	name: string
	uuid: string
	assets: Asset[]
}

export interface AssetResult {
	reference?: string
	collection: string
	asset: string
	name: string
	mimetype: string
}
export type AssetResults = AssetResult[]

export interface AssetManager {
	open: (options: any) => Promise<AssetResults>
	source: (reference: AssetResult) => string
	get: (reference: AssetResult) => Asset | undefined
	collectionName: (collection: string) => string
	collectionAssets: (collection: string) => Asset[]
}