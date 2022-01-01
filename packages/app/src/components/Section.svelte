<script lang="ts">
	export let round: string = ''
	export let rounded: boolean = false
	export let alt: boolean = false
	export let padded: boolean = false
	let clazz: string = ''
	export { clazz as class}
</script>

<section class={`${clazz||''}`} class:roundTop={round==='top'} class:roundBottom={round==='bottom'} class:alt class:padded class:rounded>
	<slot></slot>
</section>

<style>
	section {
		overflow: auto;
		background: var(--nav-bg);
	}
	section.padded {
		padding: .5em;
	}
	section.rounded {
		border-radius: .75em;
	}
	section.roundTop {
		border-radius: .75em .75em 0 0;
	}
	section.roundBottom {
		border-radius: 0 0 .75em .75em;
	}
	section.alt {
		background: var(--bar-bg);
	}
</style>