<script lang='ts'>
  import ModuleWrapper from './ModuleWrapper.svelte'
  import type { ActionInterface } from './interfaces/Action'
  import type { ServiceChannel, ServiceInterface } from './interfaces/Service'
  import { createServiceChannel } from './services'
  import { refreshActions } from './stores/actions'

	export let service: ServiceInterface
	export let action: ActionInterface

	let serviceChannel: ServiceChannel = createServiceChannel(service.uuid)
</script>

<ModuleWrapper this={service?.actionEvents?.conditions.find(v=>v.id===action.id)?.ConditionComponent} bind:condition={action.condition} channel={serviceChannel} data={service.data} id={action.id} refresh={refreshActions}/>

<style>
</style>