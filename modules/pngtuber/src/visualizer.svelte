<script lang="ts">
import Button from "@kettek/litch-app/src/components/Button.svelte";

	export let frequencyData: number[] = []
	export let shown: boolean
</script>

<main>
	<nav>
		<Button on:click={()=>{shown = false}}>back</Button>
	</nav>
	<div class='visualizer'>
		{#each frequencyData as f}
			<section>
				<article style="--height: {f/255*100}%;"></article>
			</section>
		{/each}
	</div>
</main>

<style>
	main {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		z-index: 1;
	}
	.visualizer {
		display: flex;
		background: #000;
		padding: .5em;
	}
	section {
		position: relative;
		height: 100%;
		flex: 1;
	}
	article {
		position: absolute;
		bottom: 0;
		width: 100%;
		height: var(--height);
		background: linear-gradient(#e66465, #9198e5);
	}
</style>