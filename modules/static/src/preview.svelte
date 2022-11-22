<script type="ts">
	import type { ModuleChannel } from "@kettek/litch-app/src/interfaces/ModuleInstance"
	import type { AssetManager } from '@kettek/litch-app/src/interfaces/Asset'
	import type { SettingsInterface } from './Settings'
	import { createEntry } from './funcs'

	export let settings: SettingsInterface = {
		entries: [],
	}
	export let assets: AssetManager

	export let update: (value: any) => void

	export let zoom: number = 1

	export let channel: ModuleChannel

	let port = 0
	channel.receive = async (msg) => {
		if (msg.topic === 'staticPort') {
			port = msg.message
		}
	}

	function isLocal(p: string) {
		try {
			let url = new URL(p)
			return false
		} catch(err) {
			return true
		}
	}

	let editingEntryIndex = -1

	function onDoubleClick(index: number) {
		// It's a bit bad to do this sort of work here, but it's more intuitive than having to have settings open to handle it.
		let entry = settings.entries[index]
		if (!entry) return
		if (entry.sourceType === 'url') {
			let el = document.createElement('input')
			el.setAttribute('type', 'file')
			el.click()
			el.addEventListener('change', (e2: Event) => {
				if (!el || el.files?.length === 0) return
				entry.source = el.files[0].path
				update(settings)
			})
		} else if (entry.sourceType === 'asset') {
			// TODO: Show a popup asset picker.
		} else if (entry.sourceType === 'text') {
			editingEntryIndex = index
		}
	}
	function onBlur() {
		editingEntryIndex = -1
	}
	function onInput(index: number, event: InputEvent) {
		let entry = settings.entries[index]
		if (!entry) return
		entry.source = event.target.value
		update(settings)
	}
	function edit(node: HTMLElement) {
		const keydown = (e: KeyboardEvent) => {
			if (e.code === 'Escape') {
				onBlur()
			} else if (e.code === 'Enter' && !e.shiftKey) {
				onBlur()
			}
		}
		node.addEventListener('keydown', keydown)
	}

	// Drag and drop
	function readFileAsText(file: File) {
		return new Promise((resolve, reject) => {
			let reader = new FileReader()

			reader.onload = _ => {
				resolve(reader.result)
			}
			reader.onerror = reject

			reader.readAsText(file)
		})
	}
	async function handleDrop(e: DragEvent) {
		if (!e.dataTransfer) return
		e.preventDefault()
		for (let item of e.dataTransfer.items) {
			if (item.kind === 'file') {
				let file = item.getAsFile()
				let entry = {
					...createEntry(),
					name: file.name,
				}
				if (file.type.startsWith('text')) {
					entry.source = await readFileAsText(file)
					entry.sourceType = 'text'
				} else {
					entry.source = file.path
				}
				settings.entries.push(entry)
			}
		}
		update(settings)
	}
	function handleDragOver(e: DragEvent) {
		e.preventDefault()
	}

	let movingIndex: number = -1
	let movingX: number = 0
	let movingY: number = 0
	function move(node: HTMLElement) {
		const mousedown = (e: MouseEvent) => {
			if (!e.shiftKey) return
			e.preventDefault()
			e.stopPropagation()

			movingX = movingY = 0
			movingIndex = -1

			node.dispatchEvent(
				new CustomEvent('movestart')
			)

			const mousemove = (e: MouseEvent) => {
				movingX += e.movementX / zoom
				movingY += e.movementY / zoom
			}
			const mouseup = (e: MouseEvent) => {
				movingX += e.movementX / zoom
				movingY += e.movementY / zoom

				if (movingX !== 0 || movingY !== 0) {
					settings.entries[movingIndex].left += movingX
					settings.entries[movingIndex].top += movingY
					update(settings)
				}

				movingIndex = -1

				window.removeEventListener('mousemove', mousemove, false)
				window.removeEventListener('mouseup', mouseup, false)
			}
			window.addEventListener('mousemove', mousemove, false)
			window.addEventListener('mouseup', mouseup, false)
		}

		node.addEventListener('mousedown', mousedown, false)

		return {
			destroy() {
				node.removeEventListener('mousedown', mousedown, false)
			}
		}
	}
</script>

<div title='Hold Shift to move or edit static entries' on:drop={handleDrop} on:dragover={handleDragOver}>
	{#each settings.entries as entry, index}
		<article style="left: {((movingIndex===index?movingX:0)+entry.left)*zoom}px; top: {((movingIndex===index?movingY:0)+entry.top)*zoom}px; width: {entry.width&&editingEntryIndex!==index?entry.width*zoom+'px':''}; height: {entry.height&&editingEntryIndex!==index?entry.height*zoom+'px':''}; {entry.style}" use:move on:movestart={_=>movingIndex=index} on:dblclick={_=>onDoubleClick(index)}>
			{#if entry.sourceType === 'text'}
				{#if editingEntryIndex === index}
					<textarea autofocus on:blur={onBlur} on:input={e=>onInput(index, e)} use:edit>{entry.source}</textarea>
				{:else}
					<pre style="width: {entry.width?'100%':''}; height: {entry.height?'100%':''}; font-size: {zoom*16}px">{entry.source}</pre>
				{/if}
			{:else if entry.sourceType === 'asset'}
				{#if entry.reference?.mimetype?.startsWith('image')}
					<img alt="" src={assets.source(entry.reference)} style="width: {entry.width?'100%':''}; height: {entry.height?'100%':''};"/>
				{:else if entry.reference?.mimetype?.startsWith('video')}
					<video autoplay loop style="width: {entry.width?'100%':''}; height: {entry.height?'100%':''};">
						<track kind="captions"/>
						<source src="{assets.source(entry.reference)}" type="{entry.reference.mimetype}">
					</video>
				{/if}
			{:else if entry.sourceType === 'url'}
				{#if isLocal(entry.source)}
					{#if port > 0}
						<img alt=''	src="http://localhost:{port}{encodeURI(entry.source)}?0" style="width: {entry.width?'100%':''}; height: {entry.height?'100%':''};">
					{/if}
				{:else}
					<img alt='' src="{entry.source}" style="width: {entry.width?'100%':''}; height: {entry.height?'100%':''};">
				{/if}
			{/if}
		</article>
	{/each}
</div>

<style>
	div {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
	article {
		position: absolute;
		overflow: hidden;
	}
	article:before, article:after {
		content: '';
		position: absolute;
		left: 0; top: 0;
		right: 0; bottom: 0;
	}
	article:before {
		border: 1px solid black;
	}
	article:after {
		border: 1px dashed white;
	}
</style>