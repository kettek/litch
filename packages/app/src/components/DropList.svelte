<script lang="ts">
	import Icon from './Icon.svelte'
	export let primary: boolean = false
	export let secondary: boolean = false
	export let tertiary: boolean = false
	export let open: boolean = true
</script>

<main style={$$props.style} class:primary class:secondary class:tertiary>
	<header on:click={()=>{open=!open}}>
		<Icon icon={open?'down':'forward'}></Icon>
		<slot name="heading"/>
	</header>
	<section class:open>
		<slot name="content"/>
	</section>
</main>

<style>
	main {
		padding: 1em;
		margin: 0.25em 0;
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
	}
	header {
		color: var(--text);
		height: 2em;
		line-height: 2em;
		font-weight: 600;
		padding: 0 0.5em;
		border-radius: 0.25em 0.25em 1em 1em;
		user-select: none;
		cursor: pointer;
	}
	.primary > header {
		background: var(--primary);
	}
	.secondary > header {
		background: var(--secondary);
	}
	.tertiary > header {
		background: var(--tertiary);
	}
	section {
		background: var(--bar-bg);
		margin: 0 0.75em 1em 0.75em;
		padding: 1em;
		border-radius: 0 0 1em 1em;
		height: 100%;
		overflow: auto;
	}
	.primary > section {
		color: var(--primary);
	}
	.secondary > section {
		color: var(--secondary);
	}
	.tertiary > section {
		color: var(--tertiary);
	}
	section {
		max-height: 0;
		transition: max-height .1s ease-in-out;
	}
	section > * {
		opacity: 0;
	}
	section.open > * {
		opacity: 1;
	}
	section.open {
		max-height: 100%;
	}
</style>