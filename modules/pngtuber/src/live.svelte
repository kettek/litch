<script type="ts">
	import type { SettingsInterface } from './Settings'

	export let settings: SettingsInterface
</script>

<img alt='' src='{settings.emotions[0]?.faces[settings.currentFace]?.reference}'/>

<style>
	img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
</style>