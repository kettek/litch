<script lang='ts'>
	import { _ } from 'svelte-i18n'

	import SplitPane from './components/SplitPane.svelte'
	import Menu from './components/Menu.svelte'
	import MenuOption from './components/MenuOption.svelte'
	import DropList from './components/DropList.svelte'
	import Card from './components/Card.svelte'
	import ItemBar from './components/ItemBar.svelte'
	import ItemGroup from './components/ItemGroup.svelte'
	import type { ServiceSourceInterface } from './interfaces/Service'
	import { services } from './stores/services'

</script>

<SplitPane type='horizontal' pos={25}>
	<section slot='a'>
		<Card secondary noBack flyX={-500}>
			<svelte:fragment slot='title'>
				{$_('services.title')}
			</svelte:fragment>
			<section slot='content'>
				<nav>
					{#each $services as service}
						<article>
							{service.title}
							<input type='checkbox' bind:checked={service.enabled}/>
						</article>
					{/each}
				</nav>
			</section>
		</Card>
	</section>
	<section slot='b'>
		Selected service settings here
	</section>
</SplitPane>

<style>
	nav {
		display: flex;
		flex-direction: column;
	}
	article {
	}
</style>