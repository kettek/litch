<script>
	import { onDestroy } from 'svelte'

	let component
	export { component as this }
	let target
	let cmp

	const create = () => {
		cmp = new component({
			target,
			props: $$restProps,
		})
	}

	const cleanup = () => {
		if (!cmp) return
		cmp.$destroy()
		cmp = null
	}

	$: if (component && target && !cmp) {
		cleanup()
		create()
	}

	$: if (cmp) {
		cmp.$set($$restProps)
	}

	onDestroy(cleanup)
</script>

<div on:click on:dblclick on:mousedown on:mouseup bind:this={target} />
