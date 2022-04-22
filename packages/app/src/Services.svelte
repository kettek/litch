<script lang='ts'>
	import { _ } from 'svelte-i18n'

	import SplitPane from './components/SplitPane.svelte'
	import Card from './components/Card.svelte'
	import Button from './components/Button.svelte'
	import Icon from './components/Icon.svelte'
	import type { ServiceInterface, ServiceSourceInterface } from './interfaces/Service'
	import { refreshServices, services } from './stores/services'
	import { publisher } from './modules'
	import ModuleWrapper from './ModuleWrapper.svelte'
	import type { Format, FormatMessageObject } from "./interfaces/Format"

	function toggleService(s: ServiceInterface) {
		s.enabled = !s.enabled
		if (s.enabled) {
			publisher.publish(`service.${s.uuid}.enable`, {})
		} else {
			publisher.publish(`service.${s.uuid}.disable`, {})
		}
		refreshServices()
	}

	let selectedUUID: string
	$: focusedService = $services.find(v=>v.uuid===selectedUUID)
	$: pendingSettings = focusedService ? JSON.parse(JSON.stringify(focusedService.settings)) : {} // FIXME: Use a clone lib

	let localeFormat: Format = (messageId: string, options?: FormatMessageObject): string => {
		return $_(`service.${selectedUUID}.${messageId}`, options)
	}

	let update: (value: any) => Promise<void> = async (value: any) => {
		if (!focusedService) return
		focusedService.settings = value
		try {
			await focusedService.channel.publish('update', focusedService.settings)
		} catch(e: any) {
			if (e.errors) {
				for (let err of e.errors) {
					console.error(err)
				}
			} else {
				console.error(e)
			}
		}
		refreshServices()
	}

</script>

<SplitPane type='horizontal' pos={25}>
	<section slot='a'>
		<Card secondary noBack flyX={-500}>
			<svelte:fragment slot='title'>
				{$_('services.title')}
			</svelte:fragment>
			<section slot='content'>
				<ul>
					{#each $services as service}
						<li
							class:enabled={service.enabled} title="{service.uuid}" on:click={()=>selectedUUID=service.uuid}
						>
							<Button on:click={() => toggleService(service)} title={service.enabled?$_('service.disable'):$_('service.enable')}>
								<Icon icon={service.enabled?'active':'inactive'}></Icon>
							</Button>
							<span>{service.title}</span>
						</li>
					{/each}
				</ul>
			</section>
		</Card>
	</section>
	<section slot='b' class='serviceSettings'>
		{#if focusedService}
			<main>
				<ModuleWrapper this={focusedService.SettingsComponent} bind:settings={pendingSettings} channel={focusedService.channel} format={localeFormat} />
			</main>
			<footer>
				<Button secondary on:click={()=>{focusedService.channel.publish('reload', focusedService.settings)}} title={$_('service.actions.reload')}>
					<Icon icon='reload'></Icon>
				</Button>
				<Button secondary on:click={()=>update(pendingSettings)} title={$_('service.actions.applyChanges')}>
					<Icon icon='checkmark'></Icon>
				</Button>
			</footer>
		{/if}
	</section>
</SplitPane>

<style>
	ul {
		margin: 0;
		padding: 0;
	}
	li {
		list-style: none;
		display: grid;
		grid-template-columns: 3em minmax(0, 1fr);
		grid-template-rows: minmax(0, 1fr);
		align-items: stretch;
		border: 1px solid transparent;
		color: var(--secondary);
	}
	section.serviceSettings {
		display: grid;
		grid-template-rows: minmax(0, 1fr) auto;
	}
	footer {
		display: grid;
		grid-auto-flow: column
	}
</style>