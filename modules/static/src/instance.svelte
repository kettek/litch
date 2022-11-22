<script type='ts'>
	import { onMount } from "svelte"
	import type { ModuleChannel } from "@kettek/litch-app/src/interfaces/ModuleInstance"

	export let channel: ModuleChannel

	// Static file server
	const http = require('http')
	const fs = require('fs')

	// Republish the static server port on new live view.
	channel.receive = async ({topic, message}) => {
		if (topic === 'refresh') {
			channel.publish('staticPort', server.address().port)
		}
	}

	let server: any
	function start() {
		server = http.createServer((req: any, res: any) => {
			let url = decodeURI(req.url.split("?")[0])

			let r = fs.createReadStream(url)

			r.on('open', function() {
				r.pipe(res)
			})

			r.on('error', function(err: Error) {
				res.end(err)
			})
		}).listen(0, () => {
			channel.publish('staticPort', server.address().port)
		})
	}

	function handleServer() {
		if (server === undefined) {
			start()
		}
	}

	onMount(() => {
		return () => {
			if (server !== undefined) {
				server.close()
			}
		}
	})
	$: handleServer()
</script>