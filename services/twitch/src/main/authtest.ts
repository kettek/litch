import { type IncomingMessage, Server, type ServerResponse } from 'http'
import { get, request } from 'https'
import { connection, Message, client as WebSocketClient } from 'websocket'

function wssTest(url: string, token: string, clientID: string, userID: string) {
	let sessionID = ''

	console.log('wssTest', url, token, clientID, userID)
	const client = new WebSocketClient()
	client.on('connectFailed', (err: Error) => {
		console.log('wss err', err)
	})
	client.on('connect', (connection: connection) => {
		console.log('wss conn')
		connection.on('error', (err: Error) => {
			console.log('wss conn err', err)
		})
		connection.on('close', () => {
			console.log('wss conn close')
		})
		connection.on('message', (message: Message) => {
			//console.log('got', message)
			if (sessionID === '') {
				if (message.type === 'utf8') {
					const data = JSON.parse(message.utf8Data)
					sessionID = data.payload.session.id

					// Wahoo, let's try to make a sub request.
					const req = request(
						{
							method: 'POST',
							hostname: 'api.twitch.tv',
							path: '/helix/eventsub/subscriptions',
							headers: {
								Authorization: `Bearer ${token}`,
								'Client-Id': clientID,
								'Content-Type': 'application/json',
							},
						},
						(res) => {
							console.log('POST for sub')
							res.on('data', (d) => {
								console.log('sub response', d.toString())
							})
						},
					)
					req.on('error', (e) => {
						console.log('req error', e)
					})
					req.write(
						JSON.stringify({
							type: 'channel.subscribe',
							version: '1',
							condition: {
								broadcaster_user_id: userID,
							},
							transport: {
								method: 'websocket',
								session_id: sessionID,
							},
						}),
					)
					req.end()
				}
			} else {
				console.log('got wss message')
				if (message.type === 'utf8') {
					const data = JSON.parse(message.utf8Data)
					console.log('got unhandled', data)
				}
			}
		})

		// Quick, let's make a sub requestie.
	})
	console.log('connect')
	client.connect(url, [], '', {
		Authorization: `Bearer ${token}`,
		'Client-Id': `${clientID}`,
		'Content-Type': 'application/json',
	})
	console.log('post connect')
}

class AuthServer {
	#httpServer: Server | null = null

	port: number = 8091

	get url(): string {
		return `http://localhost:${this.port}`
	}

	async start(clientID: string): Promise<number> {
		if (this.#httpServer) return -1
		// 32-character rand string
		let randString = [...Array(32)].map(() => Math.random().toString(36)[2]).join('')
		let port: number = 8984
		return new Promise((resolve: (value: number) => void, reject: (reason: any) => void) => {
			this.#httpServer = new Server((req: IncomingMessage, res: ServerResponse) => {
				const url = new URL(`http://localhost:${port}${req.url}`)
				if (url.pathname == '/auth') {
					res.writeHead(200)
					res.write(`<script>
	const queryString = window.location.hash.slice(1)
	const params = new URLSearchParams(queryString)
	const accessToken = params.get("access_token")
	const state = params.get("state")
	if (accessToken) {
		window.location.replace(window.location.href.substring(0, window.location.href.lastIndexOf('/'))+'/'+'creds'+'?key='+accessToken+'&state='+state)
	}
</script>`)
					res.end()
					return
				} else if (url.pathname.startsWith('/creds')) {
					const token = url.searchParams.get('key')
					const state = url.searchParams.get('state')
					if (state !== randString) {
						res.writeHead(500)
						res.write('bad state string :(')
						res.end()
						return
					}
					res.writeHead(200)
					res.write('<script>window.close()</script>')
					res.write('got it, close dis window :)')
					res.end()
					console.log('got oauth token', token)
					// Let's call the validate API to see.
					/*get(
						{
							method: 'GET',
							hostname: 'id.twitch.tv',
							path: '/oauth2/validate',
							headers: {
								Authorization: `OAuth ${token}`,
							},
						},
						(res: IncomingMessage) => {
							console.log(res.statusCode)
							console.log(res.headers)
							res.on('data', (d: Buffer) => {
								console.log(d)
								console.log(d.toString())
							})
						},
					)*/

					console.log('userID request?')
					// Let's get the user ID for someone special.
					get(
						{
							method: 'GET',
							hostname: 'api.twitch.tv',
							path: '/helix/users?login=kts_kettek',
							headers: {
								Authorization: `Bearer ${token}`,
								'Client-Id': clientID,
							},
						},
						(res: IncomingMessage) => {
							console.log('response to userID')
							console.log(res.statusCode)
							//console.log(res.headers)
							res.on('data', (d: Buffer) => {
								console.log('got data in userID data')
								//console.log(d)
								const { data } = JSON.parse(d.toString()) as any
								console.log('got', data)
								if (data[0].id) {
									console.log('got', data.id)
									console.log('REQUEST TIME!!!!!')
									wssTest('wss://eventsub.wss.twitch.tv/ws', token, clientID, data[0].id)
								}
							})
							res.on('error', (err: Error) => {
								console.log('crap', err)
							})
						},
					)

					// Let's test wss

					return
				}

				const scopes = ['channel:read:redemptions', 'channel:read:subscriptions']
				let scopeString = scopes.map((scope) => scope.replace(':', '%3A')).join('+')

				res.writeHead(302, {
					Location: `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=${clientID}&redirect_uri=http://localhost:${port}/auth&scope=${scopeString}&state=${randString}`,
				})
				res.end()
			})
			console.log('made server?', this.#httpServer.address())
			this.#httpServer.addListener('listening', () => {
				port = (this.#httpServer?.address() as any).port
				resolve(port)
			})
			this.#httpServer.addListener('error', (err: Error) => {
				reject(err)
			})
			this.#httpServer.listen(port)
		})
	}
	stop(): void {
		if (!this.#httpServer) return
		this.#httpServer.close()
		this.#httpServer = null
	}
}

export async function AwaitAuth(clientID: string) {
	const auth = new AuthServer()
	const port = await auth.start(clientID)
	console.log('listening on', port)
}
