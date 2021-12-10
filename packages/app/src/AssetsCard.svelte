<script type='ts'>
	import type { Asset, Collection } from './interfaces/Asset'
	import { httpReference, collections as realCollections } from './assets'
	import { createEventDispatcher, onMount } from 'svelte'
	import { fly } from 'svelte/transition'
	import { quintInOut } from 'svelte/easing'
	import { publisher } from './modules'
	import DropList from './components/DropList.svelte'
	import AssetsListing from './AssetsListing.svelte'
	import Button from './components/Button.svelte'
	import Icon from './components/Icon.svelte'

	export let multiple: boolean = false

	/* dispatch */
	const dispatch = createEventDispatcher()

	$: collections = realCollections

	let collectionUUID: string = ''
	$: collection = realCollections.find(v=>v.uuid === collectionUUID)
	$: assets = collection?.assets

	let focusedAssetUUID: string = ''
	$: focusedAsset = assets?.find((v: Asset)=>v.uuid===focusedAssetUUID)

	let selectedAssetUUIDs: string[] = []

	/* */
	function returnResults() {
		dispatch('close', selectedAssetUUIDs.map(v => {
			return {
				collectionUUID: collectionUUID,
				assetUUID: v,
				reference: `${httpReference}/${collectionUUID}/${v}`,
			}
		}))
	}

	/* filter */
	let filter: string = ''

	onMount(async () => {
		let collectionSubscriber = publisher.subscribe('collections.*', async m => {
			if (m.sourceTopic === 'collections.refresh') {
				collections = realCollections
			}
		})

		let refresher = publisher.subscribe('collections.collection.*.assets.refresh', async m => {
			let uuid = m.sourceTopic?.split('.')[2]
			if (uuid === collectionUUID) {
				collections = realCollections
			}
		})

		return () => {
			publisher.unsubscribe(collectionSubscriber)
			publisher.unsubscribe(refresher)
		}
	})
</script>

<main transition:fly="{{delay: 0, duration: 200, x: 500, y: 0, easing: quintInOut}}">
	<nav>
		<Button on:click={()=>{dispatch('close', [])}}>
			<Icon icon="back"></Icon>
		</Button>
		<header>Select an Asset</header>
	</nav>
	<section>
		<DropList secondary>
			<svelte:fragment slot="heading">
				Collections
			</svelte:fragment>
			<svelte:fragment slot="content">
				{#each collections as collection}
					<div on:click={()=>collectionUUID=collection.uuid}>
						{collection.name}
					</div>
				{/each}
			</svelte:fragment>
		</DropList>
	</section>
	<section class='assets'>
		<DropList tertiary>
			<svelte:fragment slot="heading">
				Assets
			</svelte:fragment>
			<svelte:fragment slot="content">
				<AssetsListing multiple={multiple} selector assets={assets} bind:focused={focusedAssetUUID} bind:selected={selectedAssetUUIDs} filter={filter}></AssetsListing>
			</svelte:fragment>
		</DropList>
	</section>
	<section class='return'>
		<Button tertiary on:click={returnResults}>
			<Icon icon='checkmark'></Icon>
		</Button>
	</section>
</main>

<style>
	main {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background: var(--nav-bg);
		display: grid;
		grid-template-rows: auto auto minmax(0, 1fr);
	}
	nav {
		background: var(--primary);
		color: var(--text);
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: stretch;
		justify-content: stretch;
	}
	nav header {
		font-weight: 600;
		display: flex;
		align-items: center;
		padding-left: .5em;
	}
	.assets {
		display: grid;
		grid-template-rows: minmax(0 , 1fr);
		margin-bottom: 2em;
	}
</style>