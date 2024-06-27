<script lang='ts'>
	import { _ } from 'svelte-i18n'
  import ModuleWrapper from './ModuleWrapper.svelte'
  import type { ActionTriggerModuleI } from './interfaces/Action'
  import { refreshActions } from './stores/actions'
	import type { AssetManager, AssetResults } from './interfaces/Asset'
	import { createAssetManager } from './assets'
  import type { OverlayInterface } from './interfaces/Overlay'
  import { overlays } from './stores/overlays'
	import { modules } from './stores/modules'
  import type { ModuleInstanceInterface } from './interfaces/ModuleInstance'
  import type { ModuleInterface } from './interfaces/Module'
  import type { Format, FormatMessageObject } from './interfaces/Format'
  import type { UUID } from './api'
  import AssetsCard from './AssetsCard.svelte';

	export let trigger: ActionTriggerModuleI
	
	let overlay: OverlayInterface
	let module: ModuleInstanceInterface | undefined
	let realModule: ModuleInterface
	
	$: overlay = $overlays[trigger.overlayUUID]
	$: module = overlay?.modules.find(v=>v.uuid===trigger.moduleInstanceUUID)
	$: realModule = $modules[trigger.moduleUUID]

	let showAssets = false
	let showOptions: any = {}
	let assetResolve: undefined | ((value: AssetResults) => void)
	let assetReject: undefined | ((reason?: any) => void)

	function closeAssets(e: any) {
		showAssets = false
		if (assetResolve) {
			assetResolve(e.detail)
		}
		assetResolve = undefined
		assetReject = undefined
	}
	// Create our assets and override the open property.
	let assets: AssetManager = createAssetManager()
	assets.open = (options: any): Promise<AssetResults> => new Promise((resolve, reject) => {
		assetResolve = resolve
		assetReject = reject
		showOptions = options
		showAssets = true
	})

	let localeFormat: Format = (messageId: string, options?: FormatMessageObject): string => {
		return $_(`modules.${module?.moduleUUID}.${messageId}`, options)
	}
</script>

{#if module && realModule?.eventTriggers}
	<ModuleWrapper this={realModule?.eventTriggers?.actions.find(v=>v.id===trigger.triggerID)?.ActionComponent} bind:data={trigger.data} assets={assets} settings={module.settings} refresh={refreshActions} format={localeFormat}/>
{/if}
{#if showAssets}
	<AssetsCard multiple={showOptions.multiple} collectionsOnly={showOptions.collectionsOnly} on:close={closeAssets}/>
{/if}

<style>
</style>