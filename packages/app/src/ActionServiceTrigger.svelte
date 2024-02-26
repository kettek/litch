<script lang='ts'>
	import { _ } from 'svelte-i18n'
  import ModuleWrapper from './ModuleWrapper.svelte'
  import type { ActionTriggerServiceI } from './interfaces/Action'
  import { refreshActions } from './stores/actions'
	import type { AssetManager, AssetResults } from './interfaces/Asset'
	import { createAssetManager } from './assets'
  import type { OverlayInterface } from './interfaces/Overlay'
  import type { Format, FormatMessageObject } from './interfaces/Format'
  import type { UUID } from './api'
  import AssetsCard from './AssetsCard.svelte';
  import type { ServiceInterface } from './interfaces/Service.ts'
  import { services } from './stores/services';

	export let trigger: ActionTriggerServiceI
	
	let service: ServiceInterface | undefined
	$: service = $services.find(v=>v.uuid===trigger.serviceUUID)
	
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
		return $_(`service.${service?.uuid}.${messageId}`, options)
	}
</script>

{#if service?.triggerEvents}
	<ModuleWrapper this={service?.triggerEvents?.actions.find(v=>v.id===trigger.triggerID)?.ActionComponent} bind:data={trigger.data} assets={assets} settings={service.settings} refresh={refreshActions} format={localeFormat}/>
{/if}
{#if showAssets}
	<AssetsCard multiple={showOptions.multiple} collectionsOnly={showOptions.collectionsOnly} on:close={closeAssets}/>
{/if}

<style>
</style>