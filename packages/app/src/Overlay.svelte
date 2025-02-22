<script type="ts">
	import { _ } from 'svelte-i18n'
	import type { OverlayInterface } from './interfaces/Overlay'
	import type { ModuleInterface } from './interfaces/Module'
	import ModuleWrapper from './ModuleWrapper.svelte'
	import { onMount } from 'svelte'
	import type { AssetManager } from './interfaces/Asset'
	import { createAssetManager } from './assets'
	import { refreshOverlays } from './stores/overlays'
	import type { ModuleInstanceInterface } from './interfaces/ModuleInstance'
	import { cursorHover, cursorHold } from './cursor'

	export let modules: Record<string, ModuleInterface> = {}

	export let overlay: OverlayInterface
	export let active: boolean
	let zoom: number = 0.5
	let x: number = 0
	let y: number = 0
	let movingCanvas: boolean = false
	let movingModule: string = ''
	let resizingModule: string = ''
	let resizingModuleDir: string = ''
	let resizingX: number = 0
	let resizingY: number = 0
	let movingX: number = 0
	let movingY: number = 0
	let rotatingModule: string = ''
	let rotate: number = 0
	let rotatingX: number = 0
	let rotatingY: number = 0

	let gridWidth: number = 30
	let gridHeight: number = 30
	let gridLock: boolean = true
	$: width = Math.round(overlay.canvas.width * zoom)
	$: height = Math.round(overlay.canvas.height * zoom)
	let containerWidth: number
	let containerHeight: number

	$: (width ?? height ?? zoom) ? renderCanvas() : null

	let assets: AssetManager = createAssetManager()

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
			},
		}
	}
	function setCanvasPos() {
		let [x, y] = getCoordinates(overlay.canvas.x + movingX, overlay.canvas.y + movingY)
		if (x < -overlay.canvas.width / 2) {
			x = -overlay.canvas.width / 2
		} else if (x > containerWidth - overlay.canvas.width / 4) {
			x = containerWidth - overlay.canvas.width / 4
		}
		if (y < -overlay.canvas.height / 2) {
			y = -overlay.canvas.height / 2
		} else if (y > containerHeight - overlay.canvas.height / 4) {
			y = containerHeight - overlay.canvas.height / 4
		}
		;[overlay.canvas.x, overlay.canvas.y] = getCoordinates(x, y)
		refreshOverlays()
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

			// Set active module to the given uuid.
			overlay.activeModuleUUID = uuid

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
			},
		}
	}
	function setModulePos(uuid: string) {
		let m = overlay.modules.find((v) => v.uuid === uuid)
		if (!m) return
		;[m.box.x, m.box.y] = getCoordinates(m.box.x + movingX, m.box.y + movingY)
		refreshOverlays()
	}
	// Module resize
	function resizeModule(node: HTMLElement, params: { uuid: string; act: string }) {
		const mousedown = (e: MouseEvent) => {
			if (e.button !== 0) return
			e.preventDefault()
			e.stopPropagation()

			resizingModule = params.uuid
			resizingModuleDir = params.act
			resizingX = resizingY = 0

			movingModule = params.uuid
			movingX = movingY = 0

			const addResize = (e: MouseEvent) => {
				// TODO: Don't apply lock to resizingX/resizingY when resizing to the left/top.
				if (resizingModuleDir === 'nw-resize') {
					movingX += e.movementX / zoom
					movingY += e.movementY / zoom
					resizingX -= e.movementX / zoom
					resizingY -= e.movementY / zoom
				} else if (resizingModuleDir === 'ne-resize') {
					resizingX += e.movementX / zoom
					movingY += e.movementY / zoom
					resizingY -= e.movementY / zoom
				} else if (resizingModuleDir === 'sw-resize') {
					resizingY += e.movementY / zoom
					movingX += e.movementX / zoom
					resizingX -= e.movementX / zoom
				} else if (resizingModuleDir === 'se-resize') {
					resizingX += e.movementX / zoom
					resizingY += e.movementY / zoom
				}
			}

			const mousemove = (e: MouseEvent) => {
				addResize(e)
			}

			const mouseup = () => {
				addResize(e)

				let m = overlay.modules.find((v) => v.uuid === resizingModule)
				if (m) {
					;[m.box.x, m.box.y, m.box.width, m.box.height] = [
						...getCoordinates(m.box.x + movingX, m.box.y + movingY),
						...getCoordinates(m.box.width + resizingX, m.box.height + resizingY),
					]
					refreshOverlays()
				}

				resizingModule = ''
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
			},
		}
	}

	async function updateModule(module: ModuleInstanceInterface, settings: any) {
		module.settings = settings
		refreshOverlays()
		try {
			await module.channels.publish('update', module.settings)
		} catch (e: any) {
			if (e.errors) {
				for (let err of e.errors) {
					console.error(err)
				}
			} else {
				console.error(e)
			}
		}
	}

	// Module rotate
	function rotateModule(node: HTMLElement, params: { uuid: string; act: string }) {
		const mousedown = (e: MouseEvent) => {
			if (e.button !== 0) return
			e.preventDefault()
			e.stopPropagation()

			rotatingModule = params.uuid

			let parent = node.parentElement
			let bbox = parent.getBoundingClientRect()

			let startX = bbox.left + bbox.width / 2
			let startY = bbox.top + bbox.height / 2
			rotatingX = e.clientX
			rotatingY = e.clientY

			rotate = 0

			const addRotate = (e: MouseEvent) => {
				rotatingX += e.movementX
				rotatingY += e.movementY
				rotate = Math.atan2(rotatingY - startY, rotatingX - startX)
			}

			const mousemove = (e: MouseEvent) => {
				addRotate(e)
			}

			const mouseup = () => {
				addRotate(e)

				let m = overlay.modules.find((v) => v.uuid === rotatingModule)
				if (m) {
					m.box.rotate = (m.box.rotate ?? 0) + rotate
					refreshOverlays()
				}

				rotatingModule = ''

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
			},
		}
	}

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
		for (let i = 0; i < Math.round(width / cw); i++) {
			for (let j = 0; j < Math.round(height / ch); j++) {
				ctx.fillRect(Math.round(i * cw), Math.round(j * ch), 1, 1)
			}
		}
	}

	function getCoordinates(x: number, y: number): [number, number] {
		if (gridLock) {
			x = Math.round(x / gridWidth) * gridWidth
			y = Math.round(y / gridHeight) * gridHeight
		}
		return [Math.round(x), Math.round(y)]
	}
	function getX(x: number): number {
		if (gridLock) {
			x = Math.round(x / gridWidth) * gridWidth
		}
		return Math.round(x)
	}
	function getY(y: number): number {
		if (gridLock) {
			y = Math.round(y / gridHeight) * gridHeight
		}
		return Math.round(y)
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
	function blur() {
		// Ensure losing focus removes gridLock derived from alt.
		gridLock = true
	}
</script>

<svelte:window on:keydown={keydown} on:keyup={keyup} on:blur={blur} />
<main bind:clientWidth={containerWidth} bind:clientHeight={containerHeight} on:wheel={handleWheel} use:move>
	<section
		style="--x: {movingCanvas ? getX(overlay.canvas.x + movingX) : overlay.canvas.x}px; --y: {movingCanvas
			? getY(overlay.canvas.y + movingY)
			: overlay.canvas.y}px; --width: {width}px; --height: {height}px; --zoom: {zoom}"
		on:click={(_) => (overlay.activeModuleUUID = '')}
	>
		<canvas use:cursorHold={'grab'} use:cursorHover={'move'} bind:this={canvas}></canvas>
		{#each overlay.modules
			.filter((v) => v.active)
			.sort((a, b) => (a.uuid === overlay.activeModuleUUID ? 1 : b.uuid === overlay.activeModuleUUID ? -1 : 0)) as module (module.uuid)}
			{#if modules[module.moduleUUID].previewComponent}
				<article
					use:cursorHold={'grab'}
					use:cursorHover={'move'}
					style="--x: {(movingModule === module.uuid ? getX(module.box.x + movingX) : module.box.x) * zoom}px; --y: {(movingModule === module.uuid
						? getY(module.box.y + movingY)
						: module.box.y) * zoom}px; --width: {(resizingModule === module.uuid ? getX(module.box.width + resizingX) : module.box.width) *
						zoom}px; --height: {(resizingModule === module.uuid ? getY(module.box.height + resizingY) : module.box.height) *
						zoom}px; --rad: {rotatingModule === module.uuid ? rotate + (module.box?.rotate ?? 0) : module.box?.rotate}rad"
					class:active={overlay.activeModuleUUID === module.uuid}
					use:moveModule={module.uuid}
				>
					<ModuleWrapper
						this={modules[module.moduleUUID].previewComponent}
						settings={module.settings}
						bind:box={module.box}
						{zoom}
						update={(v) => updateModule(module, v)}
						channel={module.previewChannel}
						services={module.servicesChannel}
						live={module.live}
						{assets}
					/>
					<footer>
						<span>
							{module.box.width}x{module.box.height}
						</span>
					</footer>
					{#if overlay.activeModuleUUID === module.uuid}
						<nav
							use:cursorHold={'rotateTL'}
							use:cursorHover={'rotateTL'}
							use:rotateModule={{ uuid: module.uuid, act: 'nw-resize' }}
							class="rotate-top-left"
						></nav>
						<nav
							use:cursorHold={'rotateTR'}
							use:cursorHover={'rotateTR'}
							use:rotateModule={{ uuid: module.uuid, act: 'ne-resize' }}
							class="rotate-top-right"
						></nav>
						<nav
							use:cursorHold={'rotateBL'}
							use:cursorHover={'rotateBL'}
							use:rotateModule={{ uuid: module.uuid, act: 'sw-resize' }}
							class="rotate-bottom-left"
						></nav>
						<nav
							use:cursorHold={'rotateBR'}
							use:cursorHover={'rotateBR'}
							use:rotateModule={{ uuid: module.uuid, act: 'se-resize' }}
							class="rotate-bottom-right"
						></nav>
						<nav
							use:cursorHold={'scaleNW'}
							use:cursorHover={'scaleNW'}
							use:resizeModule={{ uuid: module.uuid, act: 'nw-resize' }}
							class="top-left"
						></nav>
						<nav
							use:cursorHold={'scaleNE'}
							use:cursorHover={'scaleNE'}
							use:resizeModule={{ uuid: module.uuid, act: 'ne-resize' }}
							class="top-right"
						></nav>
						<nav
							use:cursorHold={'scaleSW'}
							use:cursorHover={'scaleSW'}
							use:resizeModule={{ uuid: module.uuid, act: 'sw-resize' }}
							class="bottom-left"
						></nav>
						<nav
							use:cursorHold={'scaleSE'}
							use:cursorHover={'scaleSE'}
							use:resizeModule={{ uuid: module.uuid, act: 'se-resize' }}
							class="bottom-right"
						></nav>
					{/if}
				</article>
			{/if}
		{/each}
		<footer>
			{#if active}
				<span class="active">{$_('overlay.state.active')}</span>
			{:else}
				<span>{$_('overlay.state.inactive')}</span>
			{/if}
			<span>
				{overlay.canvas.width}x{overlay.canvas.height} @ {Math.round(zoom * 100)}% ({width}x{height})
			</span>
		</footer>
	</section>
</main>

{#if movingModule || movingCanvas}
	<div style="--cursor: 'move'" class="catcher"></div>
{/if}

<style>
	main {
		position: absolute;
		width: 100%;
		height: 100%;
		overflow: auto;
		background: var(--bar-bg);
	}
	section {
		position: absolute;
		left: var(--x);
		top: var(--y);
		width: var(--width);
		height: var(--height);
		border: 1px dashed white;
		background: var(--overlay-bg);
	}
	article {
		position: absolute;
		left: var(--x);
		top: var(--y);
		width: var(--width);
		height: var(--height);
		border: 1px dashed gray;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: minmax(0, 1fr);
		transform: rotate(var(--rad));
	}
	article nav {
		position: absolute;
		width: calc(2em * var(--zoom));
		height: calc(2em * var(--zoom));
	}
	article nav.top-left {
		left: calc(0em * var(--zoom));
		top: calc(0em * var(--zoom));
	}
	article nav.top-right {
		right: calc(0em * var(--zoom));
		top: calc(0em * var(--zoom));
	}
	article nav.bottom-left {
		left: calc(0em * var(--zoom));
		bottom: calc(0em * var(--zoom));
	}
	article nav.bottom-right {
		right: calc(0em * var(--zoom));
		bottom: calc(0em * var(--zoom));
	}
	article nav.rotate-top-left {
		left: calc(-1em * var(--zoom));
		top: calc(-1em * var(--zoom));
	}
	article nav.rotate-top-right {
		right: calc(-1em * var(--zoom));
		top: calc(-1em * var(--zoom));
	}
	article nav.rotate-bottom-left {
		left: calc(-1em * var(--zoom));
		bottom: calc(-1em * var(--zoom));
	}
	article nav.rotate-bottom-right {
		right: calc(-1em * var(--zoom));
		bottom: calc(-1em * var(--zoom));
	}
	article.active {
		border: 1px solid #eeee22;
	}
	span.active {
		color: #eeee22;
	}
	canvas {
		position: absolute;
	}
	footer {
		position: absolute;
		right: 0;
		top: 101%;
		font-size: calc(1.5em * var(--zoom));
		font-family: overpass-mono, monospace;
		color: #999;
		pointer-events: none;
	}
	.catcher {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		/*background: rgba(255,255,255,.01);*/
		cursor: var(--cursor);
	}
</style>
