<script lang='ts'>
	export let label: boolean = false
	export let count: number = 2
	export let maxedCount: number = 1
	export let title: string = ''
	export let padded: boolean = true
	export let primary: boolean = false
	export let secondary: boolean = false
	export let tertiary: boolean = false
	export let noAlt: boolean = false

	$: repeatStr = new Array(maxedCount).fill('minmax(0, 1fr)').join(' ') + new Array(count-1).fill('auto').join(' ')
</script>

{#if label}
	<label title={title} class:ItemGroup={true} class:padded class:noAlt style='--repeat: {repeatStr};' class:primary class:secondary class:tertiary>
		<slot></slot>
		{#if $$slots.label}
			<span>
				<slot name='label'>
				</slot>
			</span>
		{/if}
	</label>
{:else}
	<article title={title} class:ItemGroup={true} class:padded class:noAlt style='--repeat: {repeatStr};' class:primary class:secondary class:tertiary>
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
		align-items: center;
	}
	.padded {
		padding: 0 .5em;
	}
	span {
		display: flex;
		align-items: center;
		padding: 0 .5em;
	}
	.primary {
		color: var(--primary);
	}
	.secondary {
		color: var(--secondary);
	}
	.tertiary {
		color: var(--tertiary);
	}
	.noAlt > :global(input), .noAlt > :global(button), .noAlt > :global(select), .noAlt > :global(textarea) {
		background: var(--bar-bg);
	}
</style>