<script lang='ts'>
	import { _ } from 'svelte-i18n'
  import ModuleWrapper from './ModuleWrapper.svelte'
  import type { ActionInterface } from './interfaces/Action'
  import type { Format, FormatMessageObject } from './interfaces/Format';
  import type { ServiceChannel, ServiceInterface } from './interfaces/Service'
  import { createServiceChannel } from './services'
  import { refreshActions } from './stores/actions'

	export let service: ServiceInterface
	export let action: ActionInterface

	let serviceChannel: ServiceChannel = createServiceChannel(service.uuid)

	let localeFormat: Format = (messageId: string, options?: FormatMessageObject): string => {
		return $_(`service.${service.uuid}.${messageId}`, options)
	}

</script>

<ModuleWrapper this={service?.actionEvents?.conditions.find(v=>v.id===action.id)?.ConditionComponent} bind:condition={action.condition} channel={serviceChannel} data={service.data} id={action.id} refresh={refreshActions} format={localeFormat}/>

<style>
</style>