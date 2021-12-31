<script lang='ts'>
	import { _ } from 'svelte-i18n'

	import SplitPane from './components/SplitPane.svelte'
	import Card from './components/Card.svelte'
	import Button from './components/Button.svelte'
	import Icon from './components/Icon.svelte'
	import type { ServiceInterface, ServiceSourceInterface } from './interfaces/Service'
	import { refreshServices, services } from './stores/services'
	import { publisher } from './modules'

	function toggleService(s: ServiceInterface) {
		s.enabled = !s.enabled
		if (s.enabled) {
			publisher.publish(`service.${s.uuid}.enable`, {})
		} else {
			publisher.publish(`service.${s.uuid}.disable`, {})
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
							class:enabled={service.enabled} title="{service.uuid}"
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
	<section slot='b'>
		Selected service settings here
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
</style>