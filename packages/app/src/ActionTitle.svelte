<script lang='ts'>
	import { _ } from 'svelte-i18n'
  import ModuleWrapper from './ModuleWrapper.svelte'
  import type { ActionServiceI } from './interfaces/Action'
  import type { Format, FormatMessageObject } from './interfaces/Format';
  import type { ServiceInterface } from './interfaces/Service'
  import type { SvelteComponent } from 'svelte'

	export let service: ServiceInterface|undefined
	export let action: ActionServiceI
	
	let component: SvelteComponent|undefined
	$: component = service?.actionEvents?.conditions.find(v=>v.id===action.id)?.TitleComponent
	$: condition = service?.actionEvents.conditions.find(v=>v.id===action.id)

	let localeFormat: Format = (messageId: string, options?: FormatMessageObject): string => {
		return $_(`service.${service?.uuid}.${messageId}`, options)
	}

</script>

{#if component}
	<ModuleWrapper this={component} bind:condition={action.condition} data={service?.data} format={localeFormat}/>
{:else}
	{#if condition}
		{condition.title}
	{:else}
		<slot></slot>
	{/if}
{/if}

<style>
</style>