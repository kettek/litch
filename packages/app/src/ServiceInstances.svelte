<script lang='ts'>
  import ServiceInstance from './ServiceInstance.svelte'
	import { services } from './stores/services'
</script>

{#each $services as service}
	{#if service.InstanceComponent}
		<ServiceInstance service={service}></ServiceInstance>
	{/if}
{/each}
