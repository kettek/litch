<script lang="ts">
	let clazz: string = ''
	export { clazz as class}
</script>

<nav class={`${clazz||''}`}>
	<slot></slot>
</nav>

<style>
	nav {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: flex-end;
		margin: 0 .25em;
	}
</style>