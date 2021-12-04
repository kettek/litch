import type { SubscriberHandler } from '@kettek/pubsub/dist/Subscriber'
import { v4 } from 'uuid'
import type { Asset } from './interfaces/Asset'

// This hurts. Need to really figure out how to get rollup to expect cjs modules in electron via import.
const mime = require('mime-types')
const http = require('http')
const fs = require('fs')

// Hmm
import { publisher } from './modules'

export let assets: Asset[] = []

// Callback for starting up the ol' server.
let server: any
export function start(): Promise<void> {
	return new Promise((resolve, reject) => {
		server = http.createServer((req: any, res: any) => {
			let url = new URL(req.url, `http://${req.headers.host}`)
			let uuid = url.pathname.slice(1)
			let asset = assets.find(v=>v.uuid===uuid)
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
			resolve()
		})
		server.listen(0)
	})
}

export let handler: SubscriberHandler = async m => {
	if (m.sourceTopic === 'assets.create') {
		let asset = {
			name: 'my asset',
			mimetype: '',
			tags: ['unsorted'],
			originalSource: '',
			redirectedSource: '',
			refresher: 0,
			...m.message,
		}
		assets.push(asset)
		publisher.publish(`assets.refresh`, {})
	} else if (m.sourceTopic === 'assets.import') {
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
			asset.redirectedSource = `http://localhost:${server.address().port}/${asset.uuid}?${asset.refresher}`
			asset.name = asset.originalSource.substring(asset.originalSource.lastIndexOf('/')+1)
			if (m.message.fromFolder) {
				console.log(asset.originalSource)
				let t = asset.originalSource.substring(0, asset.originalSource.length - (asset.name.length+1))
				console.log(t)
				console.log(t.substring(t.lastIndexOf('/')+1))
				asset.tags = [
					t.substring(t.lastIndexOf('/')+1)
				]
			}
		}

		if (typeof mimetype === 'string') {
			asset.mimetype = mimetype
		}

		assets.push(asset)
		publisher.publish(`assets.refresh`, {})
	}
}

export function setAssetSource(uuid: string, source: string) {
	let asset = getAsset(uuid)
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
		asset.redirectedSource = `http://localhost:${server.address().port}/${uuid}?${asset.refresher}`
	}

	asset.originalSource = source
	if (typeof mimetype === 'string') {
		asset.mimetype = mimetype
	}

	publisher.publish(`assets.asset.${uuid}`, {refresh: true})
	// I suppose so.
	publisher.publish(`assets.refresh`, {})
}

let sourceAdjuster = publisher.subscribe('assets.asset.*.source', async m => {
	if (!m.sourceTopic) return
	let uuid = m.sourceTopic.split('.')[2]

	setAssetSource(uuid, m.message)
})

export function getAsset(uuid: string): Asset|undefined {
	return assets.find(v=>v.uuid===uuid)
}

export let subscriber = publisher.subscribe('assets.*', handler)
console.log('now listening for assets')