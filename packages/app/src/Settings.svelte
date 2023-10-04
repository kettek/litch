<script lang="ts">
	import { onMount } from 'svelte'
	import { _ } from 'svelte-i18n'
	import { settings } from './stores/settings'
	import { overlays } from './stores/overlays'
	import { collections } from './stores/collections'
	import { actions } from './stores/actions'
	import { services } from './stores/services'
	import ItemGroup from './components/ItemGroup.svelte'
	import Button from './components/Button.svelte'
	import Icon from './components/Icon.svelte'
	import Window from './components/Window.svelte'

	let pendingSettings = {...$settings}
	$: hasChanges = !equal($settings, pendingSettings)

	function equal(a: any, b: any): boolean {
		const k1 = Object.keys(a)
		const k2 = Object.keys(b)

		if (k1.length !== k2.length) {
			return false
		}

		for (let k of k1) {
			if (a[k] !== b[k]) {
				return false
			}
		}

		return true
	}

	function applyChanges() {
		$settings.port = pendingSettings.port
	}
	
	function exportConfiguration() {
		const data = JSON.stringify({
			settings: $settings,
			overlays: $overlays,
			collections: $collections,
			services: $services,
			actions: $actions,
		})
		const blob = new Blob([data], {type: 'application/json'})
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `settings-${new Date()}.json`
		a.click()
		URL.revokeObjectURL(url)
	}
	function importConfiguration() {
		const input = document.createElement('input')
		input.type = 'file'
		input.accept = 'application/json'
		input.onchange = async (e: any) => {
			const file = e.target.files[0]
			const data = await file.text()
			const config = JSON.parse(data)
			console.log('TODO: import configuration', config)
		}
		input.click()
	}

	onMount(async () => {

	})
</script>

<Window primary on:close>
	<span slot='title'>{$_('settings.title')}</span>
	<article slot='content'>
		<ItemGroup label>
			<input type='number' bind:value={pendingSettings.port}/>
			<svelte:fragment slot='label'>
				{$_('settings.port')}
			</svelte:fragment>
		</ItemGroup>
		<Button primary disabled={!hasChanges} on:click={applyChanges}>
			<Icon icon="checkmark"></Icon>
		</Button>
		<ItemGroup label>
			<Button primary on:click={exportConfiguration}>
				<Icon icon="open"></Icon>
			</Button>
			<svelte:fragment slot='label'>
				{$_('settings.exportConfiguration')}
			</svelte:fragment>
		</ItemGroup>
		<ItemGroup label>
			<svelte:fragment slot='label'>
				{$_('settings.importConfiguration')}
			</svelte:fragment>
			<Button primary on:click={importConfiguration}>
				<Icon icon="open"></Icon>
			</Button>
		</ItemGroup>
	</article>
</Window>

<style>
	article {
		color: var(--primary);
		padding: .5em;
	}
	label {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
	}
	label span {
		margin-left: 0.25em;
	}
</style>