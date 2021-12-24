<script type='ts'>
	import { createEventDispatcher } from 'svelte'
	import { fly } from 'svelte/transition'
	import { quintInOut } from 'svelte/easing'
	import Button from './Button.svelte'
	import Icon from './Icon.svelte'

	export let primary: boolean = false
	export let secondary: boolean = false
	export let tertiary: boolean = false
	export let open: boolean = true
	export let flyX: number = 500

	const dispatch = createEventDispatcher()
	function close() {
		dispatch('close')
		open = false
	}
</script>

<main class:primary class:secondary class:tertiary transition:fly="{{delay: 0, duration: 200, x: flyX, y: 0, easing: quintInOut}}">
	<nav>
		<Button on:click={close}>
			<Icon icon="back"></Icon>
		</Button>
		<header>
			<slot name='title'></slot>
		</header>
	</nav>
	<section>
		<slot name='content'></slot>
	</section>
	<footer>
		<slot name='footer'></slot>
	</footer>
</main>

<style>
	main {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background: var(--nav-bg);
		display: grid;
		grid-template-rows: auto minmax(0, 1fr) auto;
	}
	main.primary nav {
		background: var(--primary);
	}
	main.primary section {
		color: var(--primary);
	}
	main.secondary nav {
		background: var(--secondary);
	}
	main.secondary section {
		color: var(--secondary);
	}
	main.tertiary nav {
		background: var(--tertiary);
	}
	main.tertiary section {
		color: var(--tertiary);
	}
	nav {
		color: var(--text);
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: stretch;
		justify-content: stretch;
	}
	header {
		font-weight: 600;
		display: flex;
		align-items: center;
		padding-left: .5em;
	}
	section {
		overflow: auto;
	}
</style>