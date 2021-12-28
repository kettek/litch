<script lang='ts'>
	export let label: boolean = false
	export let count: number = 2
	export let title: string = ''
	$: repeatStr = 'minmax(0, 1fr) ' + new Array(count-1).fill('auto').join(' ')
</script>

{#if label}
	<label title={title} class:ItemGroup={true} style='--repeat: {repeatStr};'>
		<slot></slot>
		{#if $$slots.label}
			<span>
				<slot name='label'>
				</slot>
			</span>
		{/if}
	</label>
{:else}
	<article title={title} class:ItemGroup={true} style='--repeat: {repeatStr};'>
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
		padding: .5em;
	}
	span {
		display: flex;
		align-items: center;
		padding: 0 .5em;
	}
</style>