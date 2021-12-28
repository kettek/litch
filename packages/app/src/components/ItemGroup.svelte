<script lang='ts'>
	export let label: boolean = false
	export let count: number = 2
	export let title: string = ''
	console.log(count, new Array(count).fill('auto').join(' '))
	$: repeatStr = 'minmax(0, 1fr) ' + new Array(count-1).fill('auto').join(' ')
</script>

{#if label}
	<label title={title} class:ItemGroup={true} style='--repeat: {repeatStr};'>
		<slot></slot>
	</label>
{:else}
	<article title={title} class:ItemGroup={true} style='--repeat: {repeatStr};'>
		<slot></slot>
	</article>
{/if}

<style>
	.ItemGroup {
		display: grid;
		grid-template-columns: var(--repeat);
		padding: .5em;
	}
</style>