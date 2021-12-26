<script lang="ts">
	export let round: string = ''
	export let alt: boolean = false
	export let flex: boolean = false
	let clazz: string = ''
	export { clazz as class}
</script>

<nav class={`${clazz||''} ${$$props.class}`} class:roundTop={round==='top'} class:roundBottom={round==='bottom'} class:alt class:flex >
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
	nav.roundBottom {
		border-radius: 0 0 .75em .75em;
	}
	nav.alt {
		background: var(--bar-bg);
	}
	nav.flex {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
	}
</style>