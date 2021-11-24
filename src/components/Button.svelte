<script type="ts">
	export let disabled: boolean = false
	export let primary: boolean = false
	export let secondary: boolean = false
	export let tertiary: boolean = false
	export let invert: boolean = false
	export let noround: boolean = false
	export let nobg: boolean = false
	export let dangerous: boolean = false
	let clazz: string = ''
	export { clazz as class}
</script>

<button class:invert class:primary class:secondary class:tertiary class:noround class:dangerous class={`${clazz||''}`} class:nobg disabled={disabled} on:click>
	<slot></slot>
</button>

<style>
	button {
		position: relative;
		min-width: 2em;
		min-height: 2em;
		margin: .5em;
		border-radius: .75em .25em;
		color: var(--text);
		cursor: pointer;
		transition: background .2s;
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
	.noround {
		border-radius: 0;
	}
	.nobg {
		background: none;
	}

	.invert.primary {
		color: var(--primary);
		background: none;
	}
	.invert.primary:hover {
		color: var(--primary-focus);
		background: none;
	}
	.invert.primary:active {
		color: var(--primary-press);
		background: none;
	}
	.invert.secondary {
		color: var(--secondary);
		background: none;
	}
	.invert.secondary:hover {
		color: var(--secondary-focus);
		background: none;
	}
	.invert.secondary:active {
		color: var(--secondary-press);
		background: none;
	}
	.invert.tertiary {
		color: var(--tertiary);
		background: none;
	}
	.invert.tertiary:hover {
		color: var(--tertiary-focus);
		background: none;
	}
	.invert.tertiary:active {
		color: var(--tertiary-press);
		background: none;
	}
	.invert.dangerous {
		color: var(--dangerous);
		background: none;
	}
	.invert.dangerous:hover {
		color: var(--dangerous-focus);
		background: none;
	}
	.invert.dangerous:hover {
		color: var(--dangerous-press);
		background: none;
	}

</style>