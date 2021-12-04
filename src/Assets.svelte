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
					<Button primary on:click={importAsset}>
						<Icon icon="open"></Icon>
					</Button>
					<Button primary on:click={importFolder}>
						<Icon icon="open-folder"></Icon>
					</Button>
					<Button primary on:click={addAsset}>
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
								<Button title='Open file' tertiary on:click={()=>{openSourceDialog()}}>
									<Icon icon='open'></Icon>
								</Button>
							</label>
						</section>
						<hr>
						<section class='selectedAsset__tags'>
							<header>tags</header>
							<section class='selectedAsset__tags__content'>
								<label class='selectedAsset__tags__tag'>
									<input type='text' disabled value={selectedAsset.mimetype}/>
								</label>
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
				<menu>
					filter goes here
				</menu>
				<article class='assets'>
					{#each assets as asset (asset.uuid)}
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
		color: var(--primary);
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