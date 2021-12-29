<script lang='ts'>
	export let label: boolean = false
	export let count: number = 2
	export let maxedCount: number = 1
	export let title: string = ''
	export let padded: boolean = true
	$: repeatStr = new Array(maxedCount).fill('minmax(0, 1fr)').join(' ') + new Array(count-1).fill('auto').join(' ')
</script>

{#if label}
	<label title={title} class:ItemGroup={true} class:padded style='--repeat: {repeatStr};'>
		<slot></slot>
		{#if $$slots.label}
			<span>
				<slot name='label'>
				</slot>
			</span>
		{/if}
	</label>
{:else}
	<article title={title} class:ItemGroup={true} class:padded style='--repeat: {repeatStr};'>
		<slot></slot>
		{#if $$slots.label}
			<span>
				<slot name='label'>
				</slot>
			</span>
		{/if}
	</article>
{/if}

<style>
	.ItemGroup {
		display: grid;
		grid-template-columns: var(--repeat);
	}
	.padded {
		padding: 0 .5em;
	}
	span {
		display: flex;
		align-items: center;
		padding: 0 .5em;
	}
</style>