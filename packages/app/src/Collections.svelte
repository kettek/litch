<script lang="ts">
	import { onMount } from 'svelte'
	import { scale, fly, FlyParams } from 'svelte/transition'
	import { quintOut, quintInOut } from 'svelte/easing'
	import { flip } from 'svelte/animate'

	import { v4 } from 'uuid'
	import { collections as realCollections } from './assets'
	import Button from './components/Button.svelte'
	import Icon from './components/Icon.svelte'
	import SplitPane from './components/SplitPane.svelte'
	import { publisher } from './modules'
	import type { Asset, Collection } from './interfaces/Asset'
	import DropList from './components/DropList.svelte'
	import type { Subscriber } from '@kettek/pubsub/dist/Subscriber'
	import { isAssetFiltered } from './assets'
	import AssetsListing from './AssetsListing.svelte'

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

	$: collections = realCollections

	let selectedCollectionUUID = ''
	$: selectedCollection = collections.find(v=>v.uuid===selectedCollectionUUID)
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

	/* Filter */
	let filterValue: string = ''

	/* Lifetime */
	onMount(async () => {
		let collectionSubscriber = publisher.subscribe('collections.*', async m => {
			if (m.sourceTopic === 'collections.refresh') {
				collections = realCollections
			}
		})

		let refresher = publisher.subscribe('collections.collection.*.assets.refresh', async m => {
			let uuid = m.sourceTopic?.split('.')[2]
			if (uuid === selectedCollectionUUID) {
				collections = realCollections
			}
		})

		return () => {
			publisher.unsubscribe(collectionSubscriber)
			publisher.unsubscribe(refresher)
		}
	})
</script>

<main transition:scale="{{delay: 0, duration: 200, easing: quintOut}}">
	<header> Assets </header>
	<article>
		<SplitPane type="horizontal" pos=25>
			<section slot='a' class='left'>
				{#if navState === 'collections'}
					<article class='slider' transition:navAnimation="{{state: 'collections', delay: 0, duration: 200, x: -500, y: 0, easing: quintInOut}}">
						<nav class='left__nav'>
							<span></span>
							<header style='text-align:center'>Collections</header>
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
									Collections
								</svelte:fragment>
								<svelte:fragment slot="content">
									<ul>
										{#each collections as collection}
											<li class='collection' class:selected={selectedCollectionUUID===collection.uuid} title={collection.uuid} on:click={()=>{selectedCollectionUUID=collection.uuid}}>
												<span>{collection.name}</span>
												<Button nomargin secondary invert={selectedCollectionUUID!==collection.uuid}>
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
								<span>Name</span>
							</label>
							<Button secondary on:click={importAsset}>
								<Icon icon="open"></Icon>
							</Button>
							<Button secondary on:click={importFolder}>
								<Icon icon="open-folder"></Icon>
							</Button>
							<Button secondary on:click={addAsset}>
								<Icon icon="add"></Icon>
							</Button>
						</article>
					<!-- Selected Asset -->
						<article class='selected__asset'>
							<DropList tertiary>
								<svelte:fragment slot="heading">
									Selected Asset
								</svelte:fragment>
								<svelte:fragment slot="content">
									{#if !selectedAsset}
										Select an Asset
									{:else}
										<label>
											<input disabled type='text' bind:value={selectedAsset.uuid}/>
										</label>
										<label>
											<input type='text' bind:value={selectedAsset.name}/> name
										</label>
										<hr>
										<section class='selectedAsset__source'>
											<label class='selectedAsset__source__file'>
												<input type='text' bind:value={selectedAsset.originalSource} placeholder='local file' />
												<Button title='Open file' secondary on:click={()=>{openSourceDialog()}}>
													<Icon icon='open'></Icon>
												</Button>
											</label>
										</section>
										<label class='selectedAsset__tags__tag'>
											<input type='text' disabled value={selectedAsset.mimetype}/>
										</label>
									
										<hr>
										<section class='selectedAsset__tags'>
											<header>tags</header>
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
	</article>
</main>

<style>
	main {
		overflow: hidden;
	}
	.left {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: auto auto auto minmax(0, 1fr);
		background: var(--nav-bg);
		overflow: hidden;
		position: relative;
	}
	.left > article {
		/*padding: .5em;*/
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
	main {
		position: absolute;
		left: 12.5%;
		top: 12.5%;
		width: 75%;
		height: 75%;
		background: var(--overlay-bg);
		z-index: 9999;
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		box-shadow: 0 0 1em .1em #000;
	}
	main > header {
		background: var(--primary);
		color: var(--text);
		text-align: center;
		height: 2em;
		line-height: 2em;
		font-weight: 600;
		font-size: 125%;
	}
	main > article {
		color: var(--secondary);
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: minmax(0, 1fr);
	}
	hr {
		border-color: var(--secondary);
		border-style: solid;
		width: calc(100% - 4em);
	}
</style>