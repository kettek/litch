<script type="ts">
	import { getVideoId } from './common'
	import type { Settings } from './common'

	export let settings: Settings

	let lastURL: string = ''
	let embedURL: string = ''
	$: checkSettings = ((settings: any) => {
		if (lastURL !== settings.url) {
			console.log(lastURL, settings.url, lastURL === settings.url)
			lastURL = settings.url
			embedURL = getEmbedURL(lastURL)
		}
	})(settings)

	function getEmbedURL(url: string) {
		url = getVideoId(url)
		if (url) {
		  return `https://www.youtube.com/embed/${url}?controls=0&autoplay=${settings.autoplay?1:0}`
		}
		return ''
	}
</script>

<iframe src="{embedURL}" title="YouTube video player" frameborder="0" allow="autoplay" allowfullscreen></iframe>

<style>
	iframe {
		width: 100%;
		height: 100%;
	}
</style>