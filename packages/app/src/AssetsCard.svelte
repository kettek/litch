<script type='ts'>
	import { _ } from 'svelte-i18n'
	import type { Asset } from './interfaces/Asset'
	import { getAsset, httpReference } from './assets'
	import { collections } from './stores/collections'
	import { createEventDispatcher } from 'svelte'
	import { settings } from './stores/settings'
	import DropList from './components/DropList.svelte'
	import AssetsListing from './AssetsListing.svelte'
	import Button from './components/Button.svelte'
	import Icon from './components/Icon.svelte'
	import Card from './components/Card.svelte'

	export let multiple: boolean = false

	/* dispatch */
	const dispatch = createEventDispatcher()

	$: collection = $collections.find(v=>v.uuid === $settings.collectionUUID)
	$: assets = collection?.assets

	let focusedAssetUUID: string = ''
	$: focusedAsset = assets?.find((v: Asset)=>v.uuid===focusedAssetUUID)

	let selectedAssetUUIDs: string[] = []

	/* */
	function returnResults() {
		dispatch('close', selectedAssetUUIDs.map(v => {
			let asset = getAsset($settings.collectionUUID, v)
			return {
				collection: $settings.collectionUUID,
				asset: v,
				reference: `${httpReference}/${$settings.collectionUUID}/${v}`,
				mimetype: asset?.mimetype,
				name: asset?.name,
			}
		}))
	}

	/* filter */
	let filter: string = ''
</script>

<Card secondary on:close>
	<svelte:fragment slot='title'>{$_('collections.selectAnAsset')}</svelte:fragment>
	<svelte:fragment slot='content'>
		<main>
			<section>
				<DropList secondary>
					<svelte:fragment slot="heading">
						{$_('collections.title')}
					</svelte:fragment>
					<svelte:fragment slot="content">
						{#each $collections as collection}
							<div on:click={()=>$settings.collectionUUID=collection.uuid}>
								{collection.name}
							</div>
						{/each}
					</svelte:fragment>
				</DropList>
			</section>
			<section class='assets'>
				<DropList tertiary>
					<svelte:fragment slot="heading">
						{$_('assets.title')}
					</svelte:fragment>
					<svelte:fragment slot="content">
						<AssetsListing multiple={multiple} selector assets={assets} bind:focused={focusedAssetUUID} bind:selected={selectedAssetUUIDs} filter={filter}></AssetsListing>
					</svelte:fragment>
				</DropList>
			</section>
		</main>
	</svelte:fragment>
	<svelte:fragment slot='footer'>
		<Button tertiary on:click={returnResults}>
			<Icon icon='checkmark'></Icon>
		</Button>
	</svelte:fragment>
</Card>

<style>
	.assets {
		display: grid;
		grid-template-rows: minmax(0 , 1fr);
		margin-bottom: 2em;
	}
	main {
		height: 100%;
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
	}
</style>