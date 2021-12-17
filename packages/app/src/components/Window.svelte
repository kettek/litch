<script type='ts'>
	import { createEventDispatcher } from 'svelte'
	import Icon from './Icon.svelte'
	import { scale } from 'svelte/transition'
	import { quintOut } from 'svelte/easing'

	export let primary: boolean = false
	export let secondary: boolean = false
	export let tertiary: boolean = false

	const dispatch = createEventDispatcher()
	function close() {
		dispatch('close')
	}
</script>

<main class:primary class:secondary class:tertiary transition:scale="{{delay: 0, duration: 200, easing: quintOut}}">
	<header class:primary class:secondary class:tertiary>
		<slot name="title"/>
		<nav>
			<button on:click={close}>
				<Icon icon='close'></Icon>
			</button>
		</nav>
	</header>
	<section class:primary class:secondary class:tertiary>
		<slot name="content"/>
	</section>
</main>

<style>
	main {
		position: absolute;
		left: 12.5%;
		top: 12.5%;
		width: 75%;
		height: 75%;
		background: var(--overlay-bg);
		z-index: 9999;
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		box-shadow: 0 0 1em .1em #000;
	}
	header {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		background: var(--primary);
		color: var(--text);
		text-align: center;
		height: 2em;
		line-height: 2em;
		font-weight: 600;
		font-size: 125%;
	}
	nav {
		display: grid;
	}
	nav > button {
		font-size: 150%;
		padding: 0em 0.3em;
		margin: 0;
		cursor: pointer;
	}
	header.secondary {
		background: var(--secondary);
	}
	header.tertiary {
		background: var(--tertiary);
	}
	section {
		color: var(--secondary);
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: minmax(0, 1fr);
		overflow: hidden;
	}
	section.primary {
		color: var(--primary);
	}
	section.secondary {
		color: var(--secondary);
	}
	section.tertiary {
		color: var(--tertiary);
	}
</style>