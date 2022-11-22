// FIXME: Ideally we could just import express and use it, but Typescript + Svelte + Rollup + Electron + Node is causing issues. Mainly, afaik, it is that rollup cannot figure out how to bundle node(or electron) commonjs modules.
import type { Express, NextFunction, Request, Response } from 'express'
import type { Server } from 'http'
const express = require('express')
const expressWs = require('express-ws')
import type { Application } from 'express-ws'
import type { MessageEvent, WebSocket, CloseEvent } from 'ws'
import { v4 } from 'uuid'

import { publisher } from './modules'

const httpTerminator = require('http-terminator')

import type { OverlayInterface } from './interfaces/Overlay'

const path = require('path')
const fs = require('fs')

// TODO: Replicate module publish topics to preview.
/*import { publisher } from './modules'
const { Publisher: PublisherR } = require('@kettek/pubsub')
import type { Publisher } from "@kettek/pubsub/dist/Publisher"*/

import { isHello, Hello, LitchMessage, LazyUpdate, isLazyUpdate, isModuleTypeRequest, ModuleTypeResponse, Endpoint, isRefresh, isModuleRefreshRequest} from './api'
import { httpReference } from './assets'

export class LitchServer {
	#express : Application | null = null
	#httpServer: Server | null = null
	#httpTerminator: any

	#filesPath : string = path.resolve('../client/public')
	#modulesPath : string = path.resolve('../../modules')

	#clients : Record<string, WebSocket> = {}

	#running : boolean
	port : number = 8090
	
	onclose : (value: void) => void = () => {}
	onactivate: (uuid: string) => void = () => {}

	//
	#activeOverlayUUID : string = ''
	#overlays : Record<string, OverlayInterface> = {}
	#modules : Record<string, string> = {} // UUID -> compiled module .js path

	get running(): boolean {
		return this.#running
	}

	get url(): string {
		return `http://localhost:${this.port}`
	}

	constructor(port?: number) {
		this.#running = false
		if (port !== undefined) {
			this.port = port
		}
	}

	updateOverlays(overlays: Record<string, OverlayInterface>) {
		console.log('update Overlays')
		this.#overlays = overlays
		// Eh... let's just do a lazy update for now that sends the entire overlay state.
		this.sendActiveOverlay()
	}
	updateModules(modules: Record<string, string>) {
		console.log('update modules')
		this.#modules = modules
	}
	updateActiveOverlay(uuid: string) {
		console.log('update active')
		this.#activeOverlayUUID = uuid
		this.sendActiveOverlay()
	}
	
	sendActiveOverlay() {
		for (let clientSocket of Object.values(this.#clients)) {
			this.sendActiveOverlayTo(clientSocket)
		}
	}
	sendActiveOverlayTo(s: WebSocket) {
		let active = this.#overlays[this.#activeOverlayUUID]
		if (active === undefined) {
			let u : LazyUpdate = {
				event: 'lazy-update',
				overlayUUID: '',
				box: {x: 0, y: 0, width: 0, height: 0},
				modules: [],
			}
			s.send(JSON.stringify(u))
			return
		}
		let u : LazyUpdate = {
			event: 'lazy-update',
			overlayUUID: this.#activeOverlayUUID,
			box: active.canvas,
			modules: active.modules
		}
		s.send(JSON.stringify(u))
	}

	async changePort(port: number) {
		if (this.port === port) return
		this.port = port
		if (this.#running) {
			await this.stop()
			await this.start()
		}
	}

	async start(): Promise<boolean> {
		this.#express = expressWs((express() as Express)).app as Application

		await new Promise((resolve: (value: void) => void, reject: (reason: any) => void) => {
			try {
				if (!this.#express) {
					return reject(null)
				}
				this.#httpServer = this.#express.listen(this.port, () => {
					console.log(`server listening on port ${this.port}`)
					resolve()
				})
				this.#httpTerminator = httpTerminator.createHttpTerminator({server: this.#httpServer})
			} catch(err: any) {
				reject(err)
			}
		})

		this.#express.use('/modules', (express as any).static(this.#modulesPath))
		console.log(`serving modules from ${this.#modulesPath}`)

		// Handle URL-based overlay activation requests. This is done to allow OBS scenes to switch to also trigger a switch to a desired overlay.
		this.#express.use('/overlays/:overlay', (req: Request, res: Response) => {
			// TODO: Check if the overlay exists and if it does not, show a "invalid overlay" message, just so endusers know if something isn't working.
			this.onactivate(req.params['overlay'])
			let filepath = path.join(this.#filesPath, 'index.html')
			fs.readFile(filepath, (err: any, data: any) => {
				if (err) {
					res.writeHead(500, {
						'Content-Type': 'text/plain',
					})
					res.write(err+'\n')
					res.end()
					return
				}
				res.writeHead(200, {
					'Content-Type': 'text/html',
				})
				res.write(data, 'utf8')
				res.end()
			})
		})

		this.#express.use('/', (express as any).static(this.#filesPath))
		console.log(`serving files from ${this.#filesPath}`)

		this.#express.ws('/', (ws: WebSocket, req: Request, next: NextFunction) => {
			const uuid = v4()
			this.#clients[uuid] = ws
			var h : Hello = {event: 'hello', uuid}
			ws.send(JSON.stringify(h))

			ws.on('message', (data: string) => {
				let msg = JSON.parse(data)
				if (isHello(msg)) {
					console.log(`hello from ${msg.uuid}`)
					// Let the target know we're ready.
					ws.send(JSON.stringify({event: 'ready'}))
				} else if (isModuleRefreshRequest(msg)) {
					// Notify requested module, if active, that it should trigger a refresh.
					let active = this.#overlays[this.#activeOverlayUUID]
					if (active) {
						for (let m of active.modules) {
							if (!m.active || m.uuid !== msg.uuid) continue
							m.channels.publish('refresh', {
								uuid: uuid,
							})
						}
					}
				} else if (isModuleTypeRequest(msg)) {
					let r : ModuleTypeResponse = {
						event: 'module-response',
						uuid: '',
						file: ''
					}
					if (this.#modules[msg.uuid]) {
						r.uuid = msg.uuid
						r.file = this.#modules[msg.uuid]
					}
					ws.send(JSON.stringify(r))
				} else {
					console.log('got unhandled :(')
				}
			})

			let endpoint = publisher.connect('*', async (msg: any): Promise<number> => {
				var e : Endpoint = {event: 'endpoint', data: msg}
				ws.send(JSON.stringify(e))
				return 1
			})

			// Send current file http reference location
			publisher.publish('collections.reference', httpReference)

			// Send overlay information
			this.sendActiveOverlayTo(ws)

			ws.onclose = (event: CloseEvent) => {
				publisher.disconnect(endpoint)
				delete this.#clients[uuid]
			}
		})

		this.#express.on('close', () => {
			this.onclose()
		})

		this.#running = true
		return this.#running
	}
	async stop(): Promise<boolean> {
		if (this.#httpTerminator) {
			await this.#httpTerminator.terminate()
		}

		this.#running = false
		return this.#running
	}
}
