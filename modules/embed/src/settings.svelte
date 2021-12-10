<script type="ts">
	import type { SettingsInterface } from './Settings'
	import type { BoxInterface } from '@kettek/litch-app/src/interfaces/Box';
	import { renderTypes, fitTypes } from './Settings'

	import Icon from '@kettek/litch-app/src/components/Icon.svelte'
	import Button from '@kettek/litch-app/src/components/Button.svelte'

	import type { ModuleChannel } from '@kettek/litch-app/src/interfaces/ModuleInstance'
import { onMount } from 'svelte';

	const mime = require('mime-types')

	export let box: BoxInterface

	export let channel: ModuleChannel

	export let settings: SettingsInterface = {
		source: '',
		override: false,
	}
	export let update: (value: any) => void
	export let updateBox: (value: any) => void

	function openFileDialog(e: any) {
		let el = document.createElement('input')
		el.setAttribute('type', 'file')
		el.setAttribute('accept', 'image/*, audio/*, video/*')
		el.click()
		el.addEventListener('change', (e2: any) => {
			settings.source = el.files[0].path
			checkIfLocal(settings.source)
		})
	}

	function checkIfLocal(p: string) {
		try {
			let url = new URL(p)
			settings.mimetype = mime.lookup(url.pathname)
			settings.isLocal = false
			settings.refresher++
		} catch(err) {
			settings.mimetype = mime.lookup(settings.source)
			settings.isLocal = true
			settings.refresher++
		}
	}

	function resizeBoxToNatural() {
		box.width = settings.naturalWidth
		box.height = settings.naturalHeight
		updateBox(box)
	}

	onMount(() => {
		console.log('set up ', channel)
		channel.receive = async (msg: any) => {
			console.log(msg)
		}
		channel.publish('ready', {})
		return () => {
			console.log('clean up')
			channel.receive = null
		}
	})
</script>

<div>
	<label class='file'>
		<input title={settings.localSource||settings.source} type='text' bind:value={settings.source} on:change={(e)=>checkIfLocal(e.target.value)} placeholder='URL or local file' />
		<Button title='Open file' tertiary on:click={openFileDialog}>
			<Icon icon='open'></Icon>
		</Button>
	</label>
	{#if settings.mimetype.startsWith('image') || settings.mimetype.startsWith('video') }
		<div class='resize'>
			<label>
				<input disabled type='number' value={settings.naturalWidth}/>
				<span>x</span>
				<input disabled type='number' value={settings.naturalHeight}/>
			</label>
			<Button title='Resize module to media size' tertiary on:click={resizeBoxToNatural}>
				<Icon icon='resize'></Icon>
			</Button>
		</div>
	{/if}
	<label>
		<input type='text' disabled={!settings.override} bind:value={settings.mimetype} placeholder='mimetype' />
		<input type="checkbox" bind:checked={settings.override}/>
		override
	</label>
	{#if settings.mimetype.startsWith('image') || settings.mimetype.startsWith('video') }
		<label class='object-position'>
			<input type='text' bind:value={settings.objectPosition} placeholder='center center'/>
			<Icon style='margin-left: .25em;' large icon='position'></Icon>
		</label>
	{/if}
	{#if settings.mimetype.startsWith('image')}
		<label>
			<select bind:value={settings.imageRendering}>
				{#each renderTypes as t}
					<option value="{t}">{t}</option>
				{/each}
			</select>
			image render
		</label>
	{/if}
	{#if settings.mimetype.startsWith('image') || settings.mimetype.startsWith('video') }
		<label>
			<select bind:value={settings.objectFit}>
				{#each fitTypes as t}
					<option value="{t}">{t}</option>
				{/each}
			</select>
			object fit
		</label>
	{/if}
	<details>
		<summary>Custom CSS</summary>
		<textarea class='css' bind:value={settings.style}></textarea>
	</details>
	<Button title='Apply' tertiary on:click={()=>update(settings)}>
		<Icon icon='checkmark'></Icon>
	</Button>
</div>

<style>
	label.file {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto auto;
	}
	.resize {
		display: grid;
		grid-template-rows: minmax(0, 1fr);
		grid-template-columns: minmax(0, 1fr) auto;
	}
	.resize label {
		display: grid;
		align-items: center;
		grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
		grid-template-rows: minmax(0, 1fr);
	}
	.resize span {
		margin: 0 .25em;
	}
	.resize input {
		width: 100%;
	}
	.object-position {
		display: grid;
		grid-template-rows: minmax(0, 1fr);
		grid-template-columns: minmax(0, 1fr) auto;
	}
	.css {
		width: 100%;
		max-width: 65ch;
		max-height: 6em;
	}
</style>