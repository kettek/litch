import type { SubscriberHandler } from '@kettek/pubsub/dist/Subscriber'
import { v4 } from 'uuid'
import type { Asset, AssetManager, AssetResult, AssetResults, Collection } from './interfaces/Asset'
import { collections, addCollection, removeCollection, addAsset, refreshCollections } from './stores/collections'
import { get } from 'svelte/store'

// This hurts. Need to really figure out how to get rollup to expect cjs modules in electron via import.
const mime = require('mime-types')
const http = require('http')
const fs = require('fs')

// Hmm
import { publisher } from './modules'
import { overlays } from './stores/overlays'

export let httpReference: string = ''

// Callback for starting up the ol' server.
let server: any
export function start(): Promise<void> {
	return new Promise((resolve, reject) => {
		server = http.createServer((req: any, res: any) => {
			let url = new URL(req.url, `http://${req.headers.host}`)
			let pathname = url.pathname.slice(1)
			let slashpos = pathname.lastIndexOf('/')
			let collectionUUID = pathname.substring(0, slashpos)
			let uuid = pathname.substring(slashpos+1)
			let asset = getAsset(collectionUUID, uuid)
			if (!asset) {
				res.writeHead(404, {
					'Content-Type': 'text/plain',
				})
				res.write('no such file\n')
				res.end()
				return
			}
			let { mimetype, originalSource } = asset
			fs.readFile(originalSource, (err: any, data: any) => {
				if (err) {
					res.writeHead(500, {
						'Content-Type': 'text/plain',
					})
					res.write(err+'\n')
					res.end()
					return
				}
				res.writeHead(200, {
					'Content-Type': mimetype,
				})
				res.write(data, "binary")
				res.end()
			})
		})
		server.on('error', (e: any) => {
			if (!server.listening) {
				reject(e)
			}
		})
		server.on('listening', () => {
			console.log(`assets serving from ${server.address().port}`)
			httpReference = `http://localhost:${server.address().port}`
			// Refresh all assets whenever the server starts.
			adjustSources()
			//
			publisher.publish('collections.reference', httpReference)
			resolve()
		})
		server.listen(0)
	})
}

export let handler: SubscriberHandler = async m => {
	if (m.topic === 'collections.refresh') {
		refreshCollections()
	} else if (m.topic === 'collections.create') {
		let collection = {
			name: 'A collection',
			uuid: v4(),
			assets: [],
			...m.message,
		}
		addCollection(collection)
		publisher.publish(`collections.refresh`, {})
	} else if (m.topic === 'collections.collection.*.assets.create') {
		let collectionUUID = m.sourceTopic?.split('.')[2]
		if (!collectionUUID) throw 'oops'
		let asset = {
			name: 'my asset',
			mimetype: '',
			tags: ['unsorted'],
			originalSource: '',
			redirectedSource: '',
			refresher: 0,
			...m.message,
		}
		addAsset(collectionUUID, asset)
		publisher.publish(`collections.collection.${collectionUUID}.assets.refresh`, {})
	} else if (m.topic === 'collections.collection.*.assets.import') {
		let collectionUUID = m.sourceTopic?.split('.')[2]
		if (!collectionUUID) throw 'oops'
		let asset = {
			name: '',
			uuid: v4(),
			mimetype: '',
			tags: ['unsorted'],
			originalSource: m.message.path,
			redirectedSource: '',
			refresher: 0,
		}
		// FIXME: Code duplication.
		let mimetype: string|boolean = ''
		let isLocal = false
		try {
			let url = new URL(asset.originalSource)
			mimetype = mime.lookup(url.pathname)
			asset.redirectedSource = ''
			asset.name = url.pathname
		} catch(err) {
			mimetype = mime.lookup(asset.originalSource)
			isLocal = true
			asset.redirectedSource = `http://localhost:${server.address().port}/${collectionUUID}/${asset.uuid}?${asset.refresher}`
			asset.name = asset.originalSource.substring(asset.originalSource.lastIndexOf('/')+1)
			if (m.message.fromFolder) {
				let t = asset.originalSource.substring(0, asset.originalSource.length - (asset.name.length+1))
				asset.tags = [
					t.substring(t.lastIndexOf('/')+1)
				]
			}
		}

		if (typeof mimetype === 'string') {
			asset.mimetype = mimetype
		}

		addAsset(collectionUUID, asset)
		publisher.publish(`collections.collection.${collectionUUID}.assets.refresh`, {})
	}
}

export function setAssetSource(collectionUUID: string, uuid: string, source: string) {
	let asset = getAsset(collectionUUID, uuid)
	if (!asset) return

	// Check if the source is a URL or local and get mimetype
	let mimetype: string|boolean = ''
	let isLocal = false
	asset.refresher++
	try {
		let url = new URL(source)
		mimetype = mime.lookup(url.pathname)
		asset.redirectedSource = ''
	} catch(err) {
		mimetype = mime.lookup(source)
		isLocal = true
		asset.redirectedSource = `http://localhost:${server.address().port}/${collectionUUID}/${asset.uuid}?${asset.refresher}`
	}

	asset.originalSource = source
	if (typeof mimetype === 'string') {
		asset.mimetype = mimetype
	}

	publisher.publish(`collections.collection.${collectionUUID}.assets.asset.${uuid}`, {refresh: true})
	// I suppose so.
	publisher.publish(`collections.collection.${collectionUUID}.assets.refresh`, {})
}

export function isAssetFiltered(asset: Asset, filterValue: string): boolean {
	if (filterValue.trim() === '') return false

	let searches = filterValue.trim().toLowerCase().split(',')

	let matches = 0
	let badMatches = 0
	let neededMatches = 0
	for (let s of searches) {
		if (s === '') continue
		s = s.trim()
		if (s[0] === '!') {
			s = s.substring(1)
			if (asset.name.toLowerCase().includes(s)) {
				badMatches++
			} else if (asset.mimetype.includes(s)) {
				badMatches++
			} else {
				for (let t of asset.tags) {
					t = t.toLowerCase()
					if (t.includes(s)) {
						badMatches++
					}
				}
			}
		} else {
			neededMatches++
			if (asset.name.toLowerCase().includes(s)) {
				matches++
			} else if (asset.mimetype.includes(s)) {
				matches++
			} else {
				for (let t of asset.tags) {
					t = t.toLowerCase()
					if (t.includes(s)) {
						matches++
					}
				}
			}
		}
	}
	if (badMatches > 0) {
		return true
	}
	if (matches >= neededMatches) {
		return false
	}

	return true
}

export function getAssetSource(ref: AssetResult): string {
	if (!ref) return ''
	let collection = get(collections).find(v=>v.uuid===ref.collection)
	if (!collection) return ''
	let asset = collection.assets.find(v=>v.uuid===ref.asset)
	if (!asset) return ''
	return asset.redirectedSource || asset.originalSource
}

function adjustSources() {
	for (let collection of get(collections)) {
		for (let asset of collection.assets) {
			if (asset.redirectedSource) {
				asset.redirectedSource = `http://localhost:${server.address().port}/${collection.uuid}/${asset.uuid}?${asset.refresher}`
			}
		}
		publisher.publish(`collections.collection.${collection.uuid}.assets.refresh`, {})
	}
}

let sourceAdjuster = publisher.subscribe('collections.collection.*.assets.asset.*.source', async m => {
	if (!m.sourceTopic) return
	let collectionUUID = m.sourceTopic.split('.')[2]
	let uuid = m.sourceTopic.split('.')[5]

	setAssetSource(collectionUUID, uuid, m.message)
})

export function getAsset(ref: AssetResult): Asset|undefined
export function getAsset(collectionUUID: string, uuid: string): Asset|undefined
export function getAsset(query: string|AssetResult, uuid?: string): Asset|undefined {
	if (typeof query === 'string') {
		return get(collections).find(v=>v.uuid===query)?.assets.find(v=>v.uuid===uuid)
	}
	return get(collections).find(v=>v.uuid===query.collection)?.assets.find(v=>v.uuid===query.asset)
}

/**
 * This creates an asset manager for passing to non-live plugin components.
 * @returns AssetManager
 */
export function createAssetManager(): AssetManager {
	return {
		open: async (options: any): Promise<AssetResults> => {
			return []
		},
		source: (ref: AssetResult): string => {
			return getAssetSource(ref)
		},
		get: (ref: AssetResult): Asset | undefined => {
			return getAsset(ref)
		},
		collectionName: (ref: string): string => {
			return get(collections).find(v=>v.uuid === ref)?.name || ''
		},
		collectionAssets: (ref: string): Asset[] => {
			return get(collections).find(v=>v.uuid === ref)?.assets || []
		}
	}
}

export let subscriber = publisher.subscribe('assets.*', handler)
publisher.subscribe('collections.create', handler)
publisher.subscribe('collections.collection.*.assets.create', handler)
publisher.subscribe('collections.collection.*.assets.import', handler)
console.log('now listening for assets')