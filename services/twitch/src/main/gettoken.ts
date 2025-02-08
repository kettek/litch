import { type IncomingMessage, Server, type ServerResponse } from 'http'
import { shell } from 'electron'

export async function getToken(clientId: string, redirectUri: string, scopes: string[]): Promise<string> {
	const url = new URL(redirectUri)
	let randString = [...Array(32)].map(() => Math.random().toString(36)[2]).join('')

	console.log(url)

	return new Promise((resolve: (token: string) => void, reject: (reason: any) => void) => {
		const server = new Server((req: IncomingMessage, res: ServerResponse) => {
			const lurl = new URL(url.protocol + '//' + url.host + req.url)
			if (lurl.pathname == url.pathname) {
				// Does it match our redirectUri pathname? If so, it's our auth from Twitch.
				// Just send a script to the browser to basically pipe the access token to another uri-based endpoint for capturee.
				res.writeHead(200)
				res.write(`<script>
	const queryString = window.location.hash.slice(1)
	const params = new URLSearchParams(queryString)
	const accessToken = params.get("access_token")
	const state = params.get("state")
	if (accessToken) {
		window.location.replace(window.location.href.substring(0, window.location.href.lastIndexOf('/'))+'/'+'litch-creds'+'?key='+accessToken+'&state='+state)
	}
</script>`)
				res.end()
				return
			} else if (lurl.pathname.startsWith('/litch-creds')) {
				const token = lurl.searchParams.get('key')
				const state = lurl.searchParams.get('state')
				if (state !== randString) {
					res.writeHead(500)
					res.write('bad state string :(')
					res.end()
					reject('mismatched state')
					return
				}
				res.writeHead(200)
				res.write('<script>window.close()</script>')
				res.write('got it, close dis window :)')
				res.end()
				// Close down the server.
				server.close((err?: Error) => {
					if (err) {
						reject(err)
					} else {
						resolve(token)
					}
				})
				return
			} else if (lurl.pathname.startsWith('/litch-start')) {
				const scope = scopes.map((s: string) => s.replace(':', '%3A')).join('+')

				res.writeHead(302, {
					Location: `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${randString}`,
				})
				res.end()
				return
			}
			res.writeHead(403)
			res.end()
		})
		server.addListener('listening', () => {
			console.log('opened server')
			shell.openExternal(`${url.protocol}//${url.host}/litch-start`)
		})
		server.addListener('error', (err: Error) => {
			reject(err)
		})
		console.log('start server', url.port)
		server.listen(url.port)
	})
}
