<script type="ts">
	export let box: any = {}
	export let settings: any = {}
</script>

<div>
	This is a dummy module
	{JSON.stringify(settings)}
	{JSON.stringify(box)}
</div>

<style>
	div {
		color: red;
	}
</style>