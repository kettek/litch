<script lang="ts">
	import Card from "@kettek/litch-app/src/components/Card.svelte"

	export let frequencyData: number[] = []
	export let shown: boolean
</script>

<Card tertiary zIndex={1} bind:open={shown} doClose>
	<svelte:fragment slot='title'>
		Sensitivity
	</svelte:fragment>
	<div slot='content' class='visualizer'>
		{#each frequencyData as f}
			<section>
				<article style="--height: {f/255*100}%;"></article>
			</section>
		{/each}
	</div>
</Card>

<style>
	.visualizer {
		display: flex;
		background: #000;
		padding: .5em;
		height: 100%;
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