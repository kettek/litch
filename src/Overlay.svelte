<script type="ts">
	import type { OverlayInterface } from './interfaces/Overlay'
	import type { ModuleInterface } from './interfaces/Module'
	import { onMount } from 'svelte'
	import { createEventDispatcher } from 'svelte'

	export let modules: Record<string, ModuleInterface> = {}

	export let overlay: OverlayInterface
	let zoom: number = 0.5
	let x: number = 0
	let y: number = 0
	let moving: boolean = false
	$: width = Math.round(overlay.canvas.width * zoom)
	$: height = Math.round(overlay.canvas.height * zoom)
	let containerWidth: number
	let containerHeight: number

	$: (width||height||zoom) ? renderCanvas() : null

	function move(node: HTMLElement, callback: (e: MouseEvent) => void) {
		const mousedown = (e: MouseEvent) => {
			if (e.button !== 1) return
			e.preventDefault()

			moving = true

			const mouseup = () => {
				moving = false

				window.removeEventListener('mousemove', callback, false)
				window.removeEventListener('mouseup', mouseup, false)
			}

			window.addEventListener('mousemove', callback, false)
			window.addEventListener('mouseup', mouseup, false)
		}
		node.addEventListener('mousedown', mousedown, false)

		return {
			destroy() {
				node.removeEventListener('mousedown', mousedown, false)
			}
		}
	}
	function setCanvasPos(e: MouseEvent) {
		x += e.movementX
		y += e.movementY
		if (x < -overlay.canvas.width / 2) {
			x = -overlay.canvas.width / 2
		} else if (x > containerWidth - overlay.canvas.width / 4) {
			x = containerWidth - overlay.canvas.width / 4
		}
		if ( y < -overlay.canvas.height / 2) {
			y = -overlay.canvas.height / 2
		} else if (y > containerHeight - overlay.canvas.height / 4) {
			y = containerHeight - overlay.canvas.height / 4
		}
	}

	function handleWheel(e: WheelEvent) {
		if (!e.ctrlKey) return
		zoom += e.deltaY < 0 ? 0.1 : -0.1
	}

	// Module moving
	function moveModule(node: HTMLElement, uuid: string) {
		const mousedown = (e: MouseEvent) => {
			if (e.button !== 0) return
			e.preventDefault()

			moving = true

			const mousemove = (e: MouseEvent) => {
				setModulePos(e, uuid)
			}

			const mouseup = () => {
				moving = false

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
	function setModulePos(e: MouseEvent, uuid: string) {
		let m = overlay.modules.find(v=>v.uuid===uuid)
		if (!m) return
		m.box.x += e.movementX / zoom
		m.box.y += e.movementY / zoom
		dispatch('refresh', uuid)
	}
	const dispatch = createEventDispatcher<string>()

	let canvas: HTMLCanvasElement
	function renderCanvas() {
		console.log('render')
		if (!canvas) return
		canvas.width = width
		canvas.height = height
		let ctx = canvas.getContext('2d')
		if (!ctx) return
		ctx.fillStyle = '#ffffff44'
		let cw: number = Math.round(32 * zoom)
		let ch: number = Math.round(32 * zoom)
		for (let i = 0; i < width/cw; i++) {
			for (let j = 0; j < height/ch; j++) {
				ctx.fillRect(Math.round(i*cw), Math.round(j*ch), 1, 1)
			}
		}
	}

	onMount(() => {
		renderCanvas()
	})

</script>

<main bind:clientWidth={containerWidth} bind:clientHeight={containerHeight} on:wheel={handleWheel} use:move={setCanvasPos}>
	<section style="--x: {x}px; --y: {y}px; --width: {width}px; --height: {height}px">
		<canvas bind:this={canvas}></canvas>
		{#each overlay.modules as module (module.uuid)}
			<article data-x={module.box.x} style="--x: {module.box.x*zoom}px; --y: {module.box.y*zoom}px; --width: {module.box.width*zoom}px; --height: {module.box.height*zoom}px" use:moveModule={module.uuid}>
				<footer>{module.uuid}</footer>
			</article>
		{/each}
		<footer>{overlay.canvas.width}x{overlay.canvas.height} @ {Math.round(zoom*100)}% ({width}x{height})</footer>
	</section>
</main>

{#if moving}
	<div class="catcher"></div>
{/if}

<style>
	main {
		position: absolute;
		width: 100%;
		height: 100%;
		overflow: auto;
		background: black;
	}
	section {
		position: absolute;
		left: var(--x);
		top: var(--y);
		width: var(--width);
		height: var(--height);
		border: 1px dashed white;
	}
	article {
		position: absolute;
		left: var(--x);
		top: var(--y);
		width: var(--width);
		height: var(--height);
		border: 1px dashed gray;
	}
	canvas {
		position: absolute;
	}
	footer {
		position: absolute;
		right: 0;
		top: 101%;
		font-family: overpass-mono, monospace;
		color: #999;
	}
	.catcher {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background: rgba(255,255,255,.01);
		cursor: move;
	}

</style>