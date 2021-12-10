<script lang="ts">
	import { scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	import { onMount } from 'svelte'

	onMount(async () => {

	})
</script>

<section transition:scale="{{delay: 0, duration: 200, easing: quintOut}}">
	<header> Settings </header>
	<article>
	</article>
</section>

<style>
	section {
		position: absolute;
		left: calc(50% - 15em);
		top: calc(50% - 15em);
		width: 30em;
		height: 30em;
		background: var(--bar-bg);
		z-index: 9999;
	}
	header {
		background: var(--primary);
		color: var(--text);
		text-align: center;
		height: 2em;
		line-height: 2em;
		font-weight: 600;
		font-size: 125%;
	}
	article {
		color: var(--primary);
		padding: .5em;
	}
</style>