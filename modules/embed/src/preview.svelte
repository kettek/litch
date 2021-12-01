<script type="ts">
	import type { SettingsInterface } from './Settings'
	const mime = require('mime-types')

	const http = require('http')
	const fs = require('fs')

	let server: any
	function start() {
		server = http.createServer((req: any, res: any) => {
			fs.readFile(settings.source, (err: any, data: any) => {
				if (err) {
					res.writeHead(500, {
						'Content-Type': 'text/plain',
					})
					res.write(err + '\n')
					res.end()
					return
				}
				res.writeHead(200, {
					'Content-Type': settings.mimetype,
				})
				res.write(data, "binary")
				res.end()
			})
		}).listen(0, () => {
			console.log(`${settings.source} accessible from ${settings.localSource}`)
		})
	}

	export let settings: SettingsInterface = {
		source: '',
		override: false,
	}
	export let update: (value: any) => void

	function handleServer(isLocal: boolean) {
		if (isLocal) {
			if (server === undefined) {
				start()
			}
			if (settings.localSource !== `http://localhost:${server.address().port}/?${settings.refresher}`) {
				settings.localSource = `http://localhost:${server.address().port}/?${settings.refresher}`
				update(settings)
			}
		} else {
			if (server !== undefined) {
				server.close()
				settings.localSource = ''
				server = undefined
				update(settings)
			}
		}
	}

	function getImageSize(el: any) {
		let image = el.target
		if (settings.naturalWidth !== image.naturalWidth || settings.naturalHeight !== image.naturalHeight) {
			settings.naturalWidth = image.naturalWidth
			settings.naturalHeight = image.naturalHeight
			update(settings)
		}
	}
	function getVideoSize(el: any) {
		let video = el.target
		if (settings.naturalWidth !== video.naturalWidth || settings.naturalHeight !== video.naturalHeight) {
			settings.naturalWidth = video.videoWidth
			settings.naturalHeight = video.videoHeight
			update(settings)
		}
	}

	$: handleServer(settings.isLocal)
</script>

<div style="image-rendering: {settings.imageRendering}; --object-fit: {settings.objectFit}; --object-position: {settings.objectPosition}; {settings.style}">
	{#if settings.mimetype.startsWith('audio')}
		audio ("{settings.localSource||settings.source}")
	{:else if settings.mimetype.startsWith('video')}
		<video on:loadedmetadata={getVideoSize} autoplay loop controls>
			<source src="{settings.localSource||settings.source}" type="{settings.mimetype}">
		</video>
	{:else if settings.mimetype.startsWith('image')}
		<img on:load={getImageSize} alt="{settings.localSource||settings.source}" src="{settings.localSource||settings.source}">
	{:else}
		unsupported embed type
	{/if}
</div>

<style>
	div {
		width: 100%;
		height: 100%;
	}
	div > * {
		object-position: var(--object-position);
		object-fit: var(--object-fit);
		width: 100%;
		height: 100%;
	}
</style>