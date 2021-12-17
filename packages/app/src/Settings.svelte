<script lang="ts">

	import { onMount } from 'svelte'
	import { settings } from './stores/settings'
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

	onMount(async () => {

	})
</script>

<Window primary on:close>
	<span slot='title'>Settings</span>
	<article slot='content'>
		<label>
			<input type='number' bind:value={pendingSettings.port} placeholder='port'/>
			<span>Port</span>
		</label>
		<Button primary disabled={!hasChanges} on:click={applyChanges}>
			<Icon icon="checkmark"></Icon>
		</Button>

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