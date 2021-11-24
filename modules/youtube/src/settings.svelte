<script type="ts">
	import type { Settings } from './common'

	export let settings: Settings
	export let update: (value: any) => void
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
	<button class="secondary" on:click={()=>update(settings)}>apply</button>
</div>

<style>
</style>