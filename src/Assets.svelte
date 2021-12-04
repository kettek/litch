<script lang="ts">
	import { onMount } from 'svelte'
	import { scale } from 'svelte/transition'
	import { quintOut } from 'svelte/easing'
	import { flip } from 'svelte/animate'

	import { v4 } from 'uuid'
	import { assets as realAssets, subscriber } from './assets'
	import Button from './components/Button.svelte'
	import Icon from './components/Icon.svelte'
	import SplitPane from './components/SplitPane.svelte'
	import { publisher } from './modules'
	import type { Asset } from './interfaces/Asset'

	function importAsset() {
		let el = document.createElement('input')
		el.setAttribute('type', 'file')
		el.click()
		el.addEventListener('change', (e2: any) => {
			if (!el || el.files?.length === 0) return

			publisher.publish(subscriber, `assets.import`, {
				path: el.files[0].path
			})
		})
	}
	function importFolder() {
		let el = document.createElement('input')
		el.setAttribute('type', 'file')
		el.setAttribute('webkitdirectory', 'true') // ???
		el.click()
		el.addEventListener('change', (e2: any) => {
			if (!el || el.files?.length === 0) return
			if (el.files.length > 50 && !window.confirm(`There are ${el.files.length} files, continue?`)) {
				return
			}
			for (let file of el.files) {
				publisher.publish(subscriber, `assets.import`, {
					path: file.path,
					fromFolder: true,
				})
			}
		})
	}
	function addAsset() {
		publisher.publish(subscriber, 'assets.create', {
			uuid: v4(),
		})
	}

	$: assets = realAssets

	let selectedAssetUUID = ''
	$: selectedAsset = assets.find(v=>v.uuid===selectedAssetUUID)

	/* Tagging */
	let pendingTagValue: string
	function addTag() {
		if (!selectedAsset) return
		if (selectedAsset.tags.includes(pendingTagValue)) return
		selectedAsset.tags.push(pendingTagValue)
		publisher.publish(`assets.refresh`, {})
	}
	function removeTag(tag: string) {
		if (!selectedAsset) return
		selectedAsset.tags = selectedAsset.tags.filter(v=>v!==tag)
		publisher.publish(`assets.refresh`, {})
	}

	/* Source */
	function openSourceDialog() {
		let el = document.createElement('input')
		el.setAttribute('type', 'file')
		el.click()
		el.addEventListener('change', (e2: any) => {
			if (!el || el.files?.length === 0) return
			if (!selectedAsset) return
			publisher.publish(`assets.asset.${selectedAssetUUID}.source`, el.files[0].path)
		})
	}

	/* Filter */
	let filterValue: string = ''
	function isAssetFiltered(asset: Asset, filterValue: string): boolean {
		if (filterValue.trim() === '') return false

		let searches = filterValue.trim().toLowerCase().split(',')

		let matches = 0
		let badMatches = 0
		let neededMatches = 0
		for (let s of searches) {
			if (s === '') continue
			s = s.trim()
			if (s[0] === '!') {
				s = s.substring(1)
				if (asset.name.toLowerCase().includes(s)) {
					badMatches++
				} else if (asset.mimetype.includes(s)) {
					badMatches++
				} else {
					for (let t of asset.tags) {
						if (t.includes(s)) {
							badMatches++
						}
					}
				}
			} else {
				neededMatches++
				if (asset.name.toLowerCase().includes(s)) {
					matches++
				} else if (asset.mimetype.includes(s)) {
					matches++
				} else {
					for (let t of asset.tags) {
						if (t.includes(s)) {
							matches++
						}
					}
				}
			}
		}
		if (badMatches > 0) {
			return true
		}
		if (matches >= neededMatches) {
			return false
		}

		return true
	}

	/* Lifetime */
	onMount(async () => {
		let subscriber = publisher.subscribe('assets.*', async m => {
			if (m.sourceTopic === 'assets.refresh') {
				assets = realAssets
			}
		})

		return () => publisher.unsubscribe(subscriber)
	})
</script>

<main transition:scale="{{delay: 0, duration: 200, easing: quintOut}}">
	<header> Assets </header>
	<article>
		<SplitPane type="horizontal" pos=25>
			<section slot='a' class='nav'>
				<nav>
					<Button secondary on:click={importAsset}>
						<Icon icon="open"></Icon>
					</Button>
					<Button secondary on:click={importFolder}>
						<Icon icon="open-folder"></Icon>
					</Button>
					<Button secondary on:click={addAsset}>
						<Icon icon="add"></Icon>
					</Button>
				</nav>
				<article class='selectedAsset'>
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
				</article>
			</section>
			<section slot='b' class='content'>
				<nav class='filter'>
					<label>
						<input placeholder='name, type, !tag, ...' type='text' bind:value={filterValue}/>
						<Button secondary invert>
							<Icon icon='filter'></Icon>
						</Button>
					</label>
				</nav>
				<article class='assets'>
					{#each assets.sort((a,b)=>a.name.localeCompare(b.name)) as asset (asset.uuid)}
						{#if !isAssetFiltered(asset, filterValue)}
							<div on:click={()=>selectedAssetUUID = asset.uuid} title='{asset.uuid}' class='asset'>
								<header>{asset.name}</header>
								<article>
									{#if asset.mimetype.startsWith('image')}
										<img alt={asset.uuid} src={asset.redirectedSource||asset.originalSource}/>
									{:else if asset.mimetype.startsWith('video')}
										<video controls src={asset.redirectedSource||asset.originalSource}>
											<track kind="captions" />
										</video>
									{:else if asset.mimetype.startsWith('audio')}
										<audio controls src={asset.redirectedSource||asset.originalSource}>
										</audio>
									{/if}
								</article>
							</div>
						{/if}
					{/each}
				</article>
			</section>
		</SplitPane>
	</article>
</main>

<style>
	.nav {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		background: var(--nav-bg);
	}
	.nav > article {
		overflow: auto;
		padding: .5em;
	}
	.content {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		width: 100%;
	}
	.assets {
		overflow: auto;
	}
	.asset {
		width: 10em;
		height: 10em;
		display: inline-grid;
		grid-template-rows: auto minmax(0, 1fr);
		margin: .5em;
		background: var(--secondary);
		color: var(--text);
		border-radius: .25em .75em;
	}
	.asset > header {
		padding: .25em 0;
		text-align: center;
		font-weight: 600;
		text-overflow: ellipsis;
		overflow: hidden;
		word-break: break-word;
	}
	.asset > article {
		padding: .25em;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.asset > article img, .asset > article video, .asset > article audio {
		width: 100%;
		height: 100%;
		object-fit: contain;
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
	.filter > label {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		padding: .5em;
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
		background: var(--secondary);
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