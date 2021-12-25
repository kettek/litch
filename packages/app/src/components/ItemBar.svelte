<script lang="ts">
	export let roundTop: boolean = false
	let clazz: string = ''
	export { clazz as class}
</script>

<nav class={`${clazz||''}`} class:roundTop >
	<slot></slot>
</nav>

<style>
	nav {
		display: grid;
		grid-auto-flow: column;
	}
	nav.roundTop {
		border-radius: .75em .75em 0 0;
	}
</style>