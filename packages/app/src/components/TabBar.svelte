<script lang="ts">
	let clazz: string = ''
	export { clazz as class}
</script>

<nav class={`${clazz||''}`}>
	<section>
		<slot></slot>
	</section>
	<article>
		<slot name='controls'></slot>
	</article>
</nav>

<style>
	nav {
		margin: 0 .25em;
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
	}
	section {
		display: flex;
		flex-direction: row;
		/*flex-wrap: wrap;*/
		align-items: flex-end;
		overflow: auto;
	}
	article {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: flex-end;
	}
</style>