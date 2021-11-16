<script lang="ts">
	import { scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	import { onMount } from 'svelte'

	onMount(async () => {

	})
</script>

<section transition:scale="{{delay: 0, duration: 200, easing: quintOut}}">
	settings
</section>

<style>
	section {
		position: absolute;
		left: 10vw;
		top: 10vh;
		width: 80vw;
		height: 80vh;
		background: #220011;
	}
</style>