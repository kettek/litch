<script type='ts'>
	import { onMount, setContext, createEventDispatcher } from 'svelte'
	import { fade } from 'svelte/transition'
	import { key } from './menu.js'

	export let x = 0
	export let y = 0

	export let primary = false
	export let secondary = false
	export let tertiary = false
	export let dangerous = false

	// whenever x and y is changed, restrict box to be within bounds
	$: ((x, y) => {
		if (!menuEl) return
		
		const rect = menuEl.getBoundingClientRect()
		x = Math.min(window.innerWidth - rect.width, x)
		if (y > window.innerHeight - rect.height) y -= rect.height
	})(x, y);
	
	const dispatch = createEventDispatcher()
	
	setContext(key, {
		dispatchClick: () => dispatch('click')
	})
	
	let menuEl: HTMLDivElement
	function onPageClick(e: any) {
		if (e.target === menuEl || menuEl.contains(e.target)) return
		dispatch('clickoutside')
	}
</script>

<style>
	div {
		position: fixed;
		z-index: 9999;
		display: grid;
        /*border-radius: 0 .25em .75em;*/
		box-shadow: 0 0 0.5em 0.05em var(--bar-bg);
		user-select: none;
	}
	.primary {
		background: var(--primary);
	}
	.secondary {
		background: var(--secondary);
	}
	.tertiary {
		background: var(--tertiary);
	}
	.dangerous {
		background: var(--dangerous);
	}
</style>

<svelte:body on:click={onPageClick} />

<div class:primary class:secondary class:tertiary class:dangerous transition:fade={{ duration: 100 }} bind:this={menuEl} style="top: {y}px; left: {x}px;">
	<slot />
</div>