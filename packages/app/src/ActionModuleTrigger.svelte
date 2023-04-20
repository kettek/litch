<script lang='ts'>
	import { _ } from 'svelte-i18n'
  import ModuleWrapper from './ModuleWrapper.svelte'
  import type { ActionTriggerCoreTriggerModuleI, ActionTriggerModuleI } from './interfaces/Action'
  import { refreshActions } from './stores/actions'
  import type { OverlayInterface } from './interfaces/Overlay'
  import { overlays } from './stores/overlays'
	import { modules } from './stores/modules'
  import type { ModuleInstanceInterface } from './interfaces/ModuleInstance'
  import type { ModuleInterface } from './interfaces/Module'
  import type { Format, FormatMessageObject } from './interfaces/Format'
  import type { UUID } from './api'

	export let trigger: ActionTriggerModuleI
	
	let overlay: OverlayInterface
	let module: ModuleInstanceInterface | undefined
	let realModule: ModuleInterface
	
	$: overlay = $overlays[trigger.overlayUUID]
	$: module = overlay?.modules.find(v=>v.uuid===trigger.moduleInstanceUUID)
	$: realModule = $modules[trigger.moduleUUID]

	let localeFormat: Format = (messageId: string, options?: FormatMessageObject): string => {
		return $_(`modules.${module?.moduleUUID}.${messageId}`, options)
	}
</script>

{#if module && realModule?.triggerEvents}
	<ModuleWrapper this={realModule?.triggerEvents?.actions.find(v=>v.id===trigger.triggerID)?.ActionComponent} bind:data={trigger.data} refresh={refreshActions} format={localeFormat}/>
{/if}

<style>
</style>