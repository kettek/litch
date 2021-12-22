<script lang="ts">
	import { _ } from 'svelte-i18n'
	import { createEventDispatcher } from 'svelte'
	import { fly, FlyParams } from 'svelte/transition'
	import { quintInOut } from 'svelte/easing'
	import { flip } from 'svelte/animate'

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
	let pendingCollectionValue: string = ''

	/* Collections */
	function addCollection() {
		publisher.publish('collections.create', {
			name: pendingCollectionValue || 'New Collection',
		})
		pendingCollectionValue = ''
	}

	/* Tagging */
	let pendingTagValue: string
	function addTag() {
		if (!selectedAsset) return
		if (selectedAsset.tags.includes(pendingTagValue)) return
		selectedAsset.tags.push(pendingTagValue)
		publisher.publish(`collections.collection.${selectedCollectionUUID}.assets.refresh`, {})
	}
	function removeTag(tag: string) {
		if (!selectedAsset) return
		selectedAsset.tags = selectedAsset.tags.filter(v=>v!==tag)
		publisher.publish(`collections.collection.${selectedCollectionUUID}.assets.refresh`, {})
	}

	/* Source */
	function openSourceDialog() {
		let el = document.createElement('input')
		el.setAttribute('type', 'file')
		el.click()
		el.addEventListener('change', (e2: any) => {
			if (!el || el.files?.length === 0) return
			if (!selectedAsset) return
			publisher.publish(`collections.collection.${selectedCollectionUUID}.assets.asset.${selectedAssetUUID}.source`, el.files[0].path)
		})
	}

	/* Asset Deletion */
	function removeAssets() {
		removeAsset(selectedCollectionUUID, selectedAssetUUID)
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
					<article class='slider' transition:navAnimation="{{state: 'collections', delay: 0, duration: 200, x: -500, y: 0, easing: quintInOut}}">
						<nav class='left__nav'>
							<span></span>
							<header style='text-align:center'>{$_('collections.title')}</header>
						</nav>
						<!-- Collections -->
						<nav class='collections'>
							<label>
								<input type='text' placeholder='New Collection' bind:value={pendingCollectionValue}/>
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
					</article>
				{:else if navState === 'collection'}
					<article class='slider' transition:navAnimation="{{state: 'collection', delay: 0, duration: 200, x: 500, y: 0, easing: quintInOut}}">
						<nav class='left__nav'>
							<Button nobg on:click={()=>{setNavState('collections')}}>
								<Icon icon='back'></Icon>
							</Button>
							<header>{selectedCollection.name}</header>
						</nav>
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
						<article class='selected__asset'>
							<DropList tertiary>
								<svelte:fragment slot="heading">
									{$_('collections.selectedAsset')}
								</svelte:fragment>
								<svelte:fragment slot="content">
									{#if !selectedAsset}
										{$_('collections.selectAnAsset')}
									{:else}
										<label>
											<input disabled type='text' bind:value={selectedAsset.uuid}/>
										</label>
										<label>
											<input type='text' bind:value={selectedAsset.name}/>
											<span>{$_('asset.name')}</span>
										</label>
										<hr>
										<section class='selectedAsset__source'>
											<label class='selectedAsset__source__file'>
												<input type='text' bind:value={selectedAsset.originalSource} placeholder='local file' />
												<Button title={$_('collections.openFile')} secondary on:click={()=>{openSourceDialog()}}>
													<Icon icon='open'></Icon>
												</Button>
											</label>
										</section>
										<label class='selectedAsset__tags__tag'>
											<input type='text' disabled value={selectedAsset.mimetype}/>
										</label>
									
										<hr>
										<section class='selectedAsset__tags'>
											<header>{$_('asset.tags')}</header>
											<section class='selectedAsset__tags__content'>
												<label class='selectedAsset__tags__tag'>
													<input type='text' bind:value={pendingTagValue} on:submit={addTag}/>
													<Button secondary on:click={addTag}>
														<Icon icon='add'></Icon>
													</Button>
												</label>
												{#each selectedAsset.tags as tag (tag)}
													<label animate:flip="{{duration: 200}}" class='selectedAsset__tags__tag'>
														<input type='text' bind:value={tag}/>
														<Button dangerous on:click={()=>{removeTag(tag)}}>
															<Icon icon='remove'></Icon>
														</Button>
													</label>
												{/each}
											</section>
										</section>
									{/if}
								</svelte:fragment>
							</DropList>
							<DropList tertiary>
								<svelte:fragment slot="heading">
									{$_('asset.actions.title')}
								</svelte:fragment>
								<svelte:fragment slot="content">
									<Button dangerous on:click={()=>{removeAssets()}}>
										{$_('asset.actions.delete')}
										<Icon icon='close'/>
									</Button>
								</svelte:fragment>
							</DropList>
						</article>
					</article>
				{/if}
			</section>
			<section slot='b' class='content'>
				<nav class='filter'>
					<label>
						<input placeholder='name, type, !tag, ...' type='text' bind:value={filterValue}/>
						<Button tertiary invert>
							<Icon icon='filter'></Icon>
						</Button>
					</label>
				</nav>
				<article class='assets tertiary'>
					<AssetsListing bind:focused={selectedAssetUUID} assets={assets} filter={filterValue}/>
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
	.left__nav {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: stretch;
		justify-content: stretch;
		background: var(--secondary);
		color: var(--text);
	}
	.left__nav > header {
		font-weight: 600;
		display: flex;
		align-items: center;
		padding-left: 0.5em ;
		min-height: 3em;
	}
	.slider {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
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
	.selectedAsset__source__file {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
	}
	.selectedAsset__tags__tag {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
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
</style>