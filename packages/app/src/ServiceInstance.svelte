<script lang='ts'>
  import ModuleWrapper from './ModuleWrapper.svelte'
  import type { ServiceInterface } from './interfaces/Service'
	import type { ActionInterface } from './interfaces/Action'
  import { publisher } from './modules'
	import { refreshServices, services } from './stores/services'
	import { actions } from './stores/actions'

	export let service: ServiceInterface

	let serviceActions: ActionInterface[]
	$: serviceActions = $actions.filter(v=>v.type==='service'&&v.service===service.uuid)

</script>

<ModuleWrapper bind:data={service.data} updateData={(data)=>{service.data=data;refreshServices()}} this={service.InstanceComponent} channel={service.channel} publisher={publisher} actions={serviceActions}/>
