<script type="ts">
	import Icon from '@kettek/litch-app/src/components/Icon.svelte'
	import Button from '@kettek/litch-app/src/components/Button.svelte'
	import type { SettingsInterface } from './Settings'

	export let settings: SettingsInterface

	export let update: (value: any) => void
</script>

<div>
	<label>
		<input type='text' bind:value={settings.emoji}/>
		Emoji
	</label>
	<label>
		<input type='number' bind:value={settings.count}/>
		Count
	</label>
	<label>
		<input type='number' bind:value={settings.updateRate}/>
		Update Rate
	</label>
	<label>
		<input type='number' bind:value={settings.maxAccumulator}/>
		Max Accumulator
	</label>
	<label>
		<input type='number' bind:value={settings.spawnX}/>
		X Spawn
	</label>
	<label>
		<input type='number' bind:value={settings.spawnY}/>
		Y Spawn
	</label>
	<label>
		<input type='number' bind:value={settings.minScale}/>
		Min Scale
	</label>
	<label>
		<input type='number' bind:value={settings.scaleRandom}/>
		Random Scale
	</label>
	<label>
		<input type='number' bind:value={settings.size}/>
		Initial Size
	</label>
	<label>
		<input type='number' bind:value={settings.xRandomRate[0]}/>
		<input type='number' bind:value={settings.xRandomRate[1]}/>
		X Random Rate (min, max)
	</label>
	<label>
		<input type='number' bind:value={settings.yRandomRate[0]}/>
		<input type='number' bind:value={settings.yRandomRate[1]}/>
		Y Random Rate (min, max)
	</label>
	<label>
		<input type='checkbox' bind:checked={settings.rotate}/>
		Randomize Starting Rotation
	</label>
	<label>
		<input type='number' bind:value={settings.rotRandomRate[0]}/>
		<input type='number' bind:value={settings.rotRandomRate[1]}/>
		Rotation Random Rate (min, max)
	</label>
	<Button tertiary on:click={()=>{update(settings)}}>
		<Icon icon='checkmark'></Icon>
	</Button>
</div>
