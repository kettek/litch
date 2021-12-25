<script type="ts">
	export let primary: boolean = false
	export let secondary: boolean = false
	export let tertiary: boolean = false
	export let dangerous: boolean = false
	let clazz: string = ''
	export { clazz as class}
</script>

<aside class:primary class:secondary class:tertiary class:dangerous class={`${clazz||''}`} on:click>
	<slot></slot>
</aside>

<style>
	aside {
		margin: .5em;
		padding: .5em;
		border-radius: .25em;
		color: var(--text);
		overflow: auto;
	}
	.primary {
		background: var(--primary);
		border-color: var(--primary);
	}
	.secondary {
		background: var(--secondary);
		border-color: var(--secondary);
	}
	.tertiary {
		background: var(--tertiary);
		border-color: var(--tertiary);
	}
	.dangerous {
		background: var(--dangerous);
		border-color: var(--dangerous);
	}
</style>