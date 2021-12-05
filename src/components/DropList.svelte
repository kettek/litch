<script lang="ts">
	export let primary: boolean = false
	export let secondary: boolean = false
	export let tertiary: boolean = false
	export let open: boolean = true
</script>

<details bind:open={open} style={$$props.style} class:primary class:secondary class:tertiary>
	<summary>
		<slot name="heading"/>
	</summary>
	<section>
		<slot name="content"/>
	</section>
</details>

<style>
	details {
		padding: 1em;
		margin: 0.25em 0;
	}
	details > summary {
		color: var(--text);
		height: 2em;
		line-height: 2em;
		font-weight: 600;
		padding: 0 0.5em;
		border-radius: 0.25em 0.25em 1em 1em;
		user-select: none;
		cursor: pointer;
	}
	details.primary > summary {
		background: var(--primary);
	}
	details.secondary > summary {
		background: var(--secondary);
	}
	details.tertiary > summary {
		background: var(--tertiary);
	}
	details > section {
		background: var(--bar-bg);
		margin: 0 0.75em 1em 0.75em;
		padding: 1em;
		border-radius: 0 0 1em 1em;
	}
	details.primary > section {
		color: var(--primary);
	}
	details.secondary > section {
		color: var(--secondary);
	}
	details.tertiary > section {
		color: var(--tertiary);
	}
</style>