<script type="ts">
	/*import type { BoxInterface } from '../../../src/interfaces/Box'

	export let box: BoxInterface*/
	export let settings: any = {}
</script>

<div>
	<label>
		<input type='text' bind:value={settings.url}/>
		URL
	</label>
	<label>
		<input type='checkbox' bind:checked={settings.autoplay}/>
		autoplay
	</label>
</div>

<style>
</style>