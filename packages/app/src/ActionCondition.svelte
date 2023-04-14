<script lang='ts'>
  import ModuleWrapper from './ModuleWrapper.svelte'
  import type { ServiceChannel, ServiceInterface } from './interfaces/Service'
  import { createServiceChannel } from './services';

	interface ActionI {
		service: string
		id: string
		condition: any
	}
	
	export let service: ServiceInterface
	export let action: ActionI

	let serviceChannel: ServiceChannel = createServiceChannel(service.uuid)
</script>

<ModuleWrapper this={service?.actionEvents?.conditions.find(v=>v.id===action.id)?.ConditionComponent} bind:condition={action.condition} channel={serviceChannel} data={service.data}/>

<style>
</style>