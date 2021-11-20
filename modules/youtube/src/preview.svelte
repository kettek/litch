<script type="ts">
	import { getVideoId } from './common'
	import type { Settings } from './common'

	export let settings: Settings

	let imageUrl: string = ''

	$: ((settings: any) => {
		console.log('settings change')
		imageUrl = `https://img.youtube.com/vi/${getVideoId(settings.url)}/hqdefault.jpg`
	})(settings)

</script>

<img alt="youtube preview" src="{imageUrl}"/>

<style>
	img {
		object-fit: contain;
		width: 100%;
		height: 100%;
	}
</style>