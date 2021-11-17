<script type="ts">
	import type { OverlayInterface } from './interfaces/Overlay'
	import type { ModuleInterface } from './interfaces/Module'
	import { onMount } from 'svelte'
	import { createEventDispatcher } from 'svelte'

	export let modules: Record<string, ModuleInterface> = {}

	export let overlay: OverlayInterface
	export let active: boolean
	let zoom: number = 0.5
	let x: number = 0
	let y: number = 0
	let movingCanvas: boolean = false
	let movingModule: string = ''
	let movingX: number = 0
	let movingY: number = 0

	let gridWidth: number = 32
	let gridHeight: number = 32
	let gridLock: boolean = true
	$: width = Math.round(overlay.canvas.width * zoom)
	$: height = Math.round(overlay.canvas.height * zoom)
	let containerWidth: number
	let containerHeight: number

	$: (width||height||zoom) ? renderCanvas() : null

	function move(node: HTMLElement) {
		const mousedown = (e: MouseEvent) => {
			if (e.button !== 1) return
			e.preventDefault()

			movingCanvas = true
			movingX = movingY = 0

			const mousemove = (e: MouseEvent) => {
				movingX += e.movementX / zoom
				movingY += e.movementY / zoom
			}

			const mouseup = () => {
				movingX += e.movementX / zoom
				movingY += e.movementY / zoom

				setCanvasPos()

				movingCanvas = false

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
	function setCanvasPos() {
		let x = overlay.canvas.x + movingY
		let y = overlay.canvas.y + movingY
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
		[overlay.canvas.x, overlay.canvas.y] = getCoordinates(x, y)
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

			movingModule = uuid
			movingX = movingY = 0

			const mousemove = (e: MouseEvent) => {
				movingX += e.movementX / zoom
				movingY += e.movementY / zoom
			}

			const mouseup = () => {
				movingX += e.movementX / zoom
				movingY += e.movementY / zoom
				setModulePos(uuid)
				movingModule = ''

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
	function setModulePos(uuid: string) {
		let m = overlay.modules.find(v=>v.uuid===uuid)
		if (!m) return
		[m.box.x, m.box.y] = getCoordinates(m.box.x + movingX, m.box.y + movingY)
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
		let cw: number = Math.round(gridWidth * zoom)
		let ch: number = Math.round(gridHeight * zoom)
		for (let i = 0; i < width/cw; i++) {
			for (let j = 0; j < height/ch; j++) {
				ctx.fillRect(Math.round(i*cw), Math.round(j*ch), 1, 1)
			}
		}
	}

	function getCoordinates(x: number, y: number): [number, number] {
		if (gridLock) {
			x = Math.round(x / gridWidth) * gridWidth
			y = Math.round(y / gridHeight) * gridHeight
		}
		return [x, y]
	}
	function getX(x: number): number {
		if (gridLock) {
			x = Math.round(x / gridWidth) * gridWidth
		}
		return x
	}
	function getY(x: number): number {
		if (gridLock) {
			x = Math.round(x / gridWidth) * gridWidth
		}
		return x
	}

	onMount(() => {
		renderCanvas()
	})

	function keydown(e: KeyboardEvent) {
		if (e.key === 'Alt') {
			e.preventDefault()
			gridLock = false
		}
	}
	function keyup(e: KeyboardEvent) {
		if (e.key === 'Alt') {
			e.preventDefault()
			gridLock = true
		}
	}
</script>

<svelte:window on:keydown={keydown} on:keyup={keyup}/>
<main bind:clientWidth={containerWidth} bind:clientHeight={containerHeight} on:wheel={handleWheel} use:move>
	<section style="--x: {movingCanvas?getX(x+movingX):x}px; --y: {movingCanvas?getY(y+movingY):y}px; --width: {width}px; --height: {height}px">
		<canvas bind:this={canvas}></canvas>
		{#each overlay.modules as module (module.uuid)}
			<article style="--x: {(movingModule===module.uuid?getX(module.box.x+movingX):module.box.x)*zoom}px; --y: {(movingModule===module.uuid?getY(module.box.y+movingY):module.box.y)*zoom}px; --width: {module.box.width*zoom}px; --height: {module.box.height*zoom}px" use:moveModule={module.uuid}>
				<footer>{module.uuid}</footer>
			</article>
		{/each}
		<footer>
			{#if active}
				<span class='active'>active</span>
			{/if}
			<span>
				{overlay.canvas.width}x{overlay.canvas.height} @ {Math.round(zoom*100)}% ({width}x{height})
			</span>
		</footer>
	</section>
</main>

{#if movingModule||movingCanvas}
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
	.active {
		color: #eeee22;
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