<script lang="ts">
	import { _ } from 'svelte-i18n'
	import { createEventDispatcher } from 'svelte'
	import { fly, FlyParams } from 'svelte/transition'

	import Window from './components/Window.svelte'

	import { v4 } from 'uuid'
	import { collections, duplicateCollection, removeAsset, removeCollection } from './stores/collections'
	import Button from './components/Button.svelte'
	import Icon from './components/Icon.svelte'
	import SplitPane from './components/SplitPane.svelte'
	import { publisher } from './modules'
	import type { Asset, Collection } from './interfaces/Asset'
	import Menu from './components/Menu.svelte'
	import MenuOption from './components/MenuOption.svelte'
	import DropList from './components/DropList.svelte'
	import AssetsListing from './AssetsListing.svelte'
	import Card from './components/Card.svelte'
	import CollectionsSelectedAsset from './CollectionsSelectedAsset.svelte'
	import CollectionsSelectedAssets from './CollectionsSelectedAssets.svelte'

	/* dispatch */
	const dispatch = createEventDispatcher()

	/* navigation */
	let navState: 'collections'|'collection' = 'collections'
	let firstMount = true
	function setNavState(where: 'collections'|'collection') {
		navState = where
		selectedAssetUUID = ''
	}
	const navAnimation = (node: Element, args: FlyParams) => {
		if ((args as any).state === 'collections' && firstMount) {
			firstMount = false
			args = {
				...args,
				x: 0,
			}
		}
		return fly(node, args)
	}

	function importAsset() {
		let el = document.createElement('input')
		el.setAttribute('type', 'file')
		el.setAttribute('multiple', true)
		el.click()
		el.addEventListener('change', (e2: Event) => {
			if (!el || el.files?.length === 0) return

			for (let file of el.files) {
				publisher.publish(`collections.collection.${selectedCollectionUUID}.assets.import`, {
					path: file.path,
				})
			}
		})
	}
	function importFolder() {
		let el = document.createElement('input')
		el.setAttribute('type', 'file')
		el.setAttribute('webkitdirectory', 'true') // ???
		el.click()
		el.addEventListener('change', (e2: Event) => {
			if (!el || el.files?.length === 0) return
			if (el.files.length > 50 && !window.confirm(`There are ${el.files.length} files, continue?`)) {
				return
			}

			for (let file of el.files) {
				publisher.publish(`collections.collection.${selectedCollectionUUID}.assets.import`, {
					path: file.path,
					fromFolder: true,
				})
			}
		})
	}
	function addAsset() {
		publisher.publish(`collections.collection.${selectedCollectionUUID}.assets.create`, {
			uuid: v4(),
		})
	}

	let selectedCollectionUUID = ''
	$: selectedCollection = $collections.find(v=>v.uuid===selectedCollectionUUID)
	$: assets = selectedCollection?.assets

	let selectedAssetUUID = ''
	$: selectedAsset = assets?.find((v: Asset)=>v.uuid===selectedAssetUUID)
	let selectedAssetUUIDs: string[] = []
	let pendingCollectionValue: string = ''

	/* Collections */
	function addCollection() {
		publisher.publish('collections.create', {
			name: pendingCollectionValue || 'New Collection',
		})
		pendingCollectionValue = ''
	}
	function handleCollectionAddKeyUp(e: any) {
		if (e.code === 'Enter') {
			e.preventDefault()
			addCollection()
		}
	}


	/* Asset Deletion */
	function removeAssets() {
		for (let uuid of selectedAssetUUIDs) {
			removeAsset(selectedCollectionUUID, uuid)
		}
		selectedAssetUUIDs = []
	}
	
	function close() {
		dispatch('close')
	}

	/* Filter */
	let filterValue: string = ''

	/* Collections Menu */
	let menuPos = {x: 0, y: 0}
	let menuUUID: string
	let showMenu = false
	async function showCollectionMenu(e: MouseEvent, uuid: string) {
		e.preventDefault()
		e.stopPropagation()
		menuUUID = uuid
		if (showMenu) {
			showMenu = false
			await new Promise(res => setTimeout(res, 100));
		}
		menuPos = { x: e.clientX, y: e.clientY }
		showMenu = true
	}
	function closeCollectionMenu() {
		showMenu = false
	}
</script>

<Window primary on:close>
	<span slot="title">{$_('collections.title')}</span>
	<article slot="content">
		<SplitPane type="horizontal" pos=25>
			<section slot='a' class='left'>
				{#if navState === 'collections'}
					<Card secondary noBack flyX={-500}>
						<svelte:fragment slot='title'>
							{$_('collections.title')}
						</svelte:fragment>
						<section class='collections__container' slot='content'>
							<nav class='collections'>
								<label>
									<input type='text' placeholder='New Collection' bind:value={pendingCollectionValue} on:keyup|preventDefault={handleCollectionAddKeyUp}/>
									<Button secondary on:click={addCollection}>
										<Icon icon="add"></Icon>
									</Button>
								</label>
							</nav>
							<article>
								<DropList secondary>
									<svelte:fragment slot="heading">
										{$_('collections.title')}
									</svelte:fragment>
									<svelte:fragment slot="content">
										<ul>
											{#each $collections as collection}
												<li class='collection' class:selected={selectedCollectionUUID===collection.uuid} title={collection.uuid} on:click={()=>{selectedCollectionUUID=collection.uuid}}>
													<span>{collection.name}</span>
													<Button nomargin secondary invert={selectedCollectionUUID!==collection.uuid} on:click={(e)=>showCollectionMenu(e, collection.uuid)}>
														<Icon icon='burger'></Icon>
													</Button>
													<Button nomargin secondary invert={selectedCollectionUUID!==collection.uuid} on:click={()=>{setNavState('collection');selectedCollectionUUID=collection.uuid}}>
														<Icon icon='forward'></Icon>
													</Button>
												</li>
											{/each}
										</ul>
									</svelte:fragment>
								</DropList>
							</article>
						</section>
					</Card>
				{:else if navState === 'collection'}
					<Card secondary on:close={()=>setNavState('collections')} flyX={-500}>
						<svelte:fragment slot='title'>
							{selectedCollection.name}
						</svelte:fragment>
						<section class='collection__container' slot='content'>
							<!-- Selected Collection -->
							<article class ='collection'>
								<label>
									<input type='text' bind:value={selectedCollection.name}/>
									<span>{$_('collections.name')}</span>
								</label>
								<Button secondary on:click={importAsset} title={$_('collections.importFiles')}>
									<Icon icon="open"></Icon>
								</Button>
								<Button secondary on:click={importFolder} title={$_('collections.importFolder')}>
									<Icon icon="open-folder"></Icon>
								</Button>
								<Button secondary on:click={addAsset} title={$_('collections.createAsset')}>
									<Icon icon="add"></Icon>
								</Button>
							</article>
							<!-- Selected Asset -->
							{#if selectedAssetUUIDs.length > 1}
								<CollectionsSelectedAssets selected={selectedAssetUUIDs} bind:collection={selectedCollection} />
							{:else}
								<CollectionsSelectedAsset bind:selectedAsset bind:selectedAssetUUID bind:selectedCollectionUUID on:remove={()=>removeAsset(selectedCollectionUUID, selectedAssetUUID)} />
							{/if}
						</section>
					</Card>
				{/if}
			</section>
			<section slot='b' class='content'>
				<nav class='filter'>
					<label title={$_('collections.filterAssetsInfo')}>
						<input placeholder='name, type, !tag, ...' type='text' bind:value={filterValue}/>
						<Button tertiary invert>
							<Icon icon='filter'></Icon>
						</Button>
					</label>
				</nav>
				<article class='assets tertiary'>
					<AssetsListing multiple bind:selected={selectedAssetUUIDs} bind:focused={selectedAssetUUID} assets={assets} filter={filterValue}/>
				</article>
			</section>
		</SplitPane>
		{#if showMenu}
			<Menu tertiary {...menuPos} on:click={closeCollectionMenu} on:clickoutside={closeCollectionMenu}>
				<MenuOption secondary on:click={()=>duplicateCollection(menuUUID)}>
					<span>{$_('collections.duplicate')}</span>
					<Icon icon='duplicate'></Icon>
				</MenuOption>
				<MenuOption dangerous on:click={()=>removeCollection(menuUUID)}>
					<span>{$_('collections.delete')}</span>
					<Icon icon='delete'></Icon>
				</MenuOption>
			</Menu>
		{/if}
	</article>
</Window>

<style>
	.left {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: auto auto auto minmax(0, 1fr);
		background: var(--nav-bg);
		overflow: hidden;
		position: relative;
	}
	article {
		color: var(--secondary);
	}
	.collections__container {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		height: 100%;
	}
	.collections__container > article {
		overflow: hidden;
		display: grid;
		grid-template-rows: minmax(0, 1fr);
	}
	.collection__container {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		height: 100%;
	}
	.content {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		width: 100%;
		overflow: hidden;
	}
	.assets {
		overflow: auto;
		padding: 0 .5em;
	}
	.filter {
		display: grid;
	}
	.filter > label, .collections > label, .collection > label {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		padding: .5em;
	}
	/* */
	ul {
		margin: 0;
		padding: 0;
	}
	li.collection.selected {
		background: var(--secondary);
		color: var(--text);
	}
	li.collection {
		list-style: none;
		min-height: 2em;
		display: grid;
		grid-template-rows: minmax(0, 1fr);
		grid-template-columns: minmax(0, 1fr) auto auto;
		justify-content: stretch;
		align-items: center;
		color: var(--secondary);
		margin: 0.5em;
		padding: 0.5em;
		border-radius: .25em;
	}
	/* window */
	nav {
		display: grid;
	}
	hr {
		border-color: var(--secondary);
		border-style: solid;
		width: calc(100% - 4em);
	}
	label > span {
		display: flex;
		align-items: center;
		justify-content: center;
		padding-left: .25em;
	}
	label {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
	}
</style>