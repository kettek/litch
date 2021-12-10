<script type="ts">
	import type { BoxInterface } from '@kettek/litch-app/src/interfaces/Box'

	//export let settings: any = {}
	export let box: BoxInterface
</script>

<div>
	{box.x}x{box.y}x{box.width}x{box.height}
</div>

<style>
	div {
		color: red;
		background: rgba(0,0,0,0.5);
		width: 100%;
		height: 100%;
	}
</style>