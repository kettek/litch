<script type="ts">
	import type { EntryInterface, SettingsInterface } from './Settings'
	import { createEntry } from './funcs'

	import ItemGroup from '@kettek/litch-app/src/components/ItemGroup.svelte'
	import ItemBar from '@kettek/litch-app/src/components/ItemBar.svelte'
	import Icon from '@kettek/litch-app/src/components/Icon.svelte'
	import Button from '@kettek/litch-app/src/components/Button.svelte'
	import DropList from '@kettek/litch-app/src/components/DropList.svelte'
	import Section from '@kettek/litch-app/src/components/Section.svelte'
	import MenuDivider from '@kettek/litch-app/src/components/MenuDivider.svelte'

	import type { AssetManager, AssetResult } from '@kettek/litch-app/src/interfaces/Asset'
	import type { Format } from '@kettek/litch-app/src/interfaces/Format'

	import type { ModuleChannel } from '@kettek/litch-app/src/interfaces/ModuleInstance'
	import { onMount } from 'svelte';

	const mime = require('mime-types')

	export let format: Format

	export let channel: ModuleChannel

	export let settings: SettingsInterface = {
		entries: [],
	}

	export let assets: AssetManager

	let selectedEntryIndex: number = 0
	$: selectedEntry = settings.entries[selectedEntryIndex]

	export let update: (value: any) => void

	function deleteEntry(index: number) {
		settings.entries.splice(index, 1)
		settings = settings
	}

	function addEntry() {
		settings.entries.push({
			...createEntry(),
			name: 'untitled',
			sourceType: 'text',
		})
		settings = settings
	}

	function replaceEntry(index: number) {
		// TODO
	}

	function checkIfLocal(p: string) {
		try {
			let url = new URL(p)
			return false
		} catch(err) {
			return true
		}
	}

	function importFile(e: any) {
		let el = document.createElement('input')
		el.setAttribute('type', 'file')
		el.setAttribute('multiple', 'true')
		el.click()
		el.addEventListener('change', (e2: Event) => {
			if (!el || el.files?.length === 0) return

			for (let file of el.files) {
				settings.entries.push({
					...createEntry(),
					name: file.name,
					source: file.path,
				})
			}
			settings = settings
		})
	}

	async function importAsset(e: any) {
		let results = await assets.open({
			multiple: true,
		})
		if (results.length === 0) return
		for (let result of results) {
			settings.entries.push({
				...createEntry(),
				sourceType: 'asset',
				name: result.name,
				reference: {
					collection: result.collection,
					asset: result.asset,
					mimetype: result.mimetype,
					name: result.name,
				}
			})
		}
		settings = settings
	}
	async function replaceAsset(e: any) {
		let results = await assets.open({
			multiple: false,
		})
		if (results.length === 0) return
		settings.entries[selectedEntryIndex].reference = results[0]
		settings = settings
	}

	// list drag and drop
	import { flip } from 'svelte/animate'
	let hoveredEntryIndex: number
	let fromEntryIndex: number
	function handleEntryDragStart(e: DragEvent, index: number) {
		if (!e.dataTransfer) return
		e.dataTransfer.effectAllowed = 'move'
		e.dataTransfer.dropEffect = 'move'
		fromEntryIndex = index
	}
	function handleEntryDrop(e: DragEvent, toIndex: number) {
		if (!e.dataTransfer) return
		e.dataTransfer.dropEffect = 'move'

		const fromIndex = fromEntryIndex

		const entries = settings.entries
		if (fromIndex < toIndex) {
			settings.entries.splice(toIndex+1, 0, entries[fromIndex])
			settings.entries.splice(fromIndex, 1)
		} else {
			settings.entries.splice(toIndex, 0, entries[fromIndex])
			settings.entries.splice(fromIndex+1, 1)
		}
		fromEntryIndex = -1
		hoveredEntryIndex = -1

		settings = settings
	}

	onMount(() => {
		return () => {
			channel.receive = null
		}
	})
</script>

<main>
	<ItemBar>
		<Button tertiary on:click={importFile} title='import file'>
			<Icon icon="open"></Icon>
		</Button>
		<Button tertiary on:click={importAsset} title='add asset'>
			<Icon icon="open"></Icon>
		</Button>
		<Button tertiary on:click={addEntry} title='add text'>
			<Icon icon="add"></Icon>
		</Button>
	</ItemBar>

	<DropList bind:open={settings.openEntries} tertiary style='overflow:auto'>
		<svelte:fragment slot="heading">
			Entries
		</svelte:fragment>
		<svelte:fragment slot="content">
			<ul class:tertiary={true}>
				{#each settings.entries as entry, index (index)}
					<li
						animate:flip="{{duration: 200}}"
						draggable={true}
						on:dragstart={e => handleEntryDragStart(e, index)}
						on:drop|preventDefault={e => handleEntryDrop(e, index)}
						ondragover="return false"
						on:dragenter={() => hoveredEntryIndex = index}
						class:active={selectedEntryIndex === index}
					 	on:click={_=>selectedEntryIndex=index}
					>
						<span>{entry.name}</span>
						<Button tertiary dangerous on:click={_=>deleteEntry(index)} title={format('delete')}>
							<Icon icon="delete"></Icon>
						</Button>
					</li>
				{/each}
			</ul>
		</svelte:fragment>
	</DropList>
	<Section alt rounded padded>
		{#if selectedEntry}
			<ItemGroup label>
				<input type='text' bind:value={selectedEntry.name}/>
				<svelte:fragment slot='label'>
					{format('name')}
				</svelte:fragment>
			</ItemGroup>
			<ItemGroup label>
				<select bind:value={selectedEntry.sourceType}>
					<option value='url'>{format('urlType')}</option>
					<option value='asset'>{format('assetType')}</option>
					<option value='text'>{format('textType')}</option>
					<option value='iframe'>{format('iframeType')}</option>
				</select>
				<svelte:fragment slot='label'>
					{format('type')}
				</svelte:fragment>
			</ItemGroup>
			{#if selectedEntry.sourceType === 'asset'}
				<ItemGroup label>
					<Button tertiary on:click={replaceAsset} title='{format('replaceAsset')}'>
						<Icon icon="open"></Icon>
					</Button>
					<svelte:fragment slot='label'>
						{format('replaceAsset')}
					</svelte:fragment>
				</ItemGroup>
			{:else if selectedEntry.sourceType === 'text'}
				<textarea bind:value={selectedEntry.source}></textarea>
			{:else if selectedEntry.sourceType === 'iframe'}
				<ItemGroup label>
					<input type='text' bind:value={selectedEntry.source}/>
					<svelte:fragment slot='label'>
						{format('source')}
					</svelte:fragment>
				</ItemGroup>
				<ItemGroup label>
					<input type='checkbox' bind:checked={selectedEntry.scrollbars}/>
					<svelte:fragment slot='label'>
						{format('scrollbars')}
					</svelte:fragment>
				</ItemGroup>
			{:else}
				<ItemGroup label>
					<input type='text' bind:value={selectedEntry.source}/>
					<svelte:fragment slot='label'>
						{format('source')}
					</svelte:fragment>
				</ItemGroup>
			{/if}
			<MenuDivider></MenuDivider>
			<ItemGroup label>
				<input type='number' bind:value={selectedEntry.left}/>
				<svelte:fragment slot='label'> {format('left')} </svelte:fragment>
			</ItemGroup>
			<ItemGroup label>
				<input type='number' bind:value={selectedEntry.top}/>
				<svelte:fragment slot='label'> {format('top')} </svelte:fragment>
			</ItemGroup>
			<ItemGroup label>
				<input type='number' bind:value={selectedEntry.width}/>
				<svelte:fragment slot='label'> {format('width')} </svelte:fragment>
			</ItemGroup>
			<ItemGroup label>
				<input type='number' bind:value={selectedEntry.height}/>
				<svelte:fragment slot='label'> {format('height')} </svelte:fragment>
			</ItemGroup>

			<MenuDivider></MenuDivider>
			<details>
				<summary>Custom CSS</summary>
				<textarea class='css' bind:value={selectedEntry.style}></textarea>
			</details>
		{/if}
	</Section>
</main>

<style>
	main {
		display: grid;
		grid-template-rows: auto auto minmax(0, 1fr);
		overflow: auto;
		height: 100%;
	}
	ul {
		margin: 0;
		padding: 0;
	}
	li {
		list-style: none;
		min-height: 2em;
		display: grid;
		grid-template-rows: minmax(0, 1fr);
		grid-template-columns: minmax(0, 1fr) auto;
		justify-content: stretch;
		align-items: stretch;
		border: 1px solid transparent;
		color: var(--tertiary);
	}
	li.active {
		border: 1px solid var(--tertiary);
	}
	li button {
		cursor: pointer;
		background: none;
		border: 0;
		color: var(--tertiary);
		text-align: left;
	}
	span {
		display: flex;
		align-items: center;
		padding: .5em;
		overflow: hidden;
		white-space: nowrap;
	}
	.preview {
		max-height: 8em;
		max-width: 8em;
	}
</style>