<script lang="ts">
	import { scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	import { onMount } from 'svelte'
	import { settings } from './stores/settings';
	import Button from './components/Button.svelte';
	import Icon from './components/Icon.svelte';

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

<section transition:scale="{{delay: 0, duration: 200, easing: quintOut}}">
	<header> Settings </header>
	<article>
		<label>
			<input type='number' bind:value={pendingSettings.port} placeholder='port'/>
			<span>Port</span>
		</label>
		<Button primary disabled={!hasChanges} on:click={applyChanges}>
			<Icon icon="checkmark"></Icon>
		</Button>
	</article>
</section>

<style>
	section {
		position: absolute;
		left: calc(50% - 15em);
		top: calc(50% - 15em);
		width: 30em;
		height: 30em;
		background: var(--nav-bg);
		z-index: 9999;
	}
	header {
		background: var(--primary);
		color: var(--text);
		text-align: center;
		height: 2em;
		line-height: 2em;
		font-weight: 600;
		font-size: 125%;
	}
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