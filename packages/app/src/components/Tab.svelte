<script type="ts">
	export let disabled: boolean = false
	export let primary: boolean = false
	export let secondary: boolean = false
	export let tertiary: boolean = false
	export let noround: boolean = false
	export let nobg: boolean = false
	export let dangerous: boolean = false
	export let nomargin: boolean = false
	export let draggable: boolean = false
	export let selected: boolean = false
	export let alt: boolean = false
	export let title: string = ''
	let clazz: string = ''
	export { clazz as class}
</script>

<button draggable={draggable} title={title} class:primary class:secondary class:tertiary class:noround class:dangerous class:nomargin class={`${clazz||''}`} class:nobg class:selected class:alt class:disabled disabled={disabled} on:click on:dragstart on:dragenter on:dragover on:drop>
	<slot></slot>
</button>

<style>
	button {
		position: relative;
		min-width: 2em;
		min-height: 2em;
		margin: .25em;
		margin-bottom: 0;
		border-radius: .75em .25em 0 0;
		cursor: pointer;
		transition: background .2s;
		background: var(--nav-bg);
		border-width: 2px;
		border-style: solid;
		border-color: var(--bar-bg);
		border-bottom: none;
		word-break: keep-all;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
	.selected {
		background: var(--bar-bg);
	}
	.alt {
		background: var(--bar-bg);
		border-color: var(--nav-bg);
	}
	.alt.selected {
		background: var(--nav-bg);
	}
	.nomargin {
		margin: 0;
	}
	.primary {
		color: var(--primary);
	}
	.primary:hover {
		color: var(--primary-focus);
	}
	.primary:active {
		color: var(--primary-press);
	}
	.secondary {
		color: var(--secondary);
	}
	.secondary:hover {
		color: var(--secondary-focus);
	}
	.secondary:active {
		color: var(--secondary-press);
	}
	.tertiary {
		color: var(--tertiary);
	}
	.tertiary:hover {
		color: var(--tertiary-focus);
	}
	.tertiary:active {
		color: var(--tertiary-press);
	}
	.dangerous {
		color: var(--dangerous);
	}
	.dangerous:hover {
		color: var(--dangerous-focus);
	}
	.dangerous:hover {
		color: var(--dangerous-press);
	}
	.noround {
		border-radius: 0;
	}
	.nobg {
		background: none;
	}

	.disabled {
		opacity: 0.4;
	}

</style>