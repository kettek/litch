<script type='ts'>
	import { onMount, getContext } from 'svelte'
	import { key } from './menu.js'
	
	export let isDisabled = false
	export let text = ''

	export let primary = false
	export let secondary = false
	export let tertiary = false
	export let dangerous = false
	
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher();
	
	const { dispatchClick } = getContext(key)
	
	const handleClick = (e: MouseEvent) => {
		if (isDisabled) return
		
		dispatch('click')
		dispatchClick()
	}
</script>

<style>
	div {
		padding: .5em;
		cursor: pointer;
		display: flex;
		align-items: center;
		color: var(--text);
	}
	.primary {
		background: var(--primary);
	}
	.primary:hover {
		background: var(--primary-focus);
	}
	.primary:active {
		background: var(--primary-press);
	}
	.secondary {
		background: var(--secondary);
	}
	.secondary:hover {
		background: var(--secondary-focus);
	}
	.secondary:active {
		background: var(--secondary-press);
	}
	.tertiary {
		background: var(--tertiary);
	}
	.tertiary:hover {
		background: var(--tertiary-focus);
	}
	.tertiary:active {
		background: var(--tertiary-press);
	}
	.dangerous {
		background: var(--dangerous);
	}
	.dangerous:hover {
		background: var(--dangerous-focus);
	}
	.dangerous:hover {
		background: var(--dangerous-press);
	}
</style>

<div 
	class:disabled={isDisabled}
	class:primary class:secondary class:tertiary class:dangerous
	on:click={handleClick}
>
	{#if text}
		{text}
	{:else}
		<slot />
	{/if}
</div>
