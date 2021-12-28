<script lang="ts">
	import { _ } from 'svelte-i18n'
	import DropList from "./components/DropList.svelte"
	import Button from './components/Button.svelte'
	import Icon from './components/Icon.svelte'
	import Section from './components/Section.svelte'
	import ItemBar from './components/ItemBar.svelte'
	import ItemGroup from './components/ItemGroup.svelte'
	import type { Collection } from './interfaces/Asset'
	import { flip } from 'svelte/animate'

	import { refreshCollections } from './stores/collections'
	import { publisher } from './modules'

	export let selected: string[] = []
	export let collection: Collection | undefined

	$: selectedAssets = collection?.assets.filter(v=>selected.find(v2=>v.uuid===v2))||[]
	$: commonTags = selectedAssets?.map(v=>v.tags).reduce((p,v)=>[...new Set(p.concat(v))], [])

	let pendingTagValue: string = ''
	function addTag() {
		if (!selectedAssets) return

		selectedAssets.forEach(v => {
			if (v.tags.indexOf(pendingTagValue) !== -1) return
			v.tags.push(pendingTagValue)
		})
		refreshCollections()
	}
	function removeTag(tag: string) {
		if (!selectedAssets) return
		selectedAssets.forEach(v => {
			v.tags = v.tags.filter(t=>t!==tag)
		})
		refreshCollections()
	}
	function removeAssets() {
		if (!selectedAssets || !collection) return
		collection.assets = collection.assets.filter(v=>!selectedAssets?.find(asset=>asset.uuid===v.uuid))
		refreshCollections()
	}
	function openSourceDialog() {
		let el = document.createElement('input')
		el.setAttribute('type', 'file')
		el.click()
		el.addEventListener('change', (e2: any) => {
			if (!el || el.files?.length === 0) return
			if (!collection || !selectedAssets[0]) return
			publisher.publish(`collections.collection.${collection.uuid}.assets.asset.${selectedAssets[0].uuid}.source`, el.files[0].path)
		})
	}

</script>

<main>
	<section class='selection'>
		<ItemBar alt round='top'>
			<Button disabled={selected.length===0} dangerous on:click={removeAssets}>
				{$_('asset.actions.delete')}
				<Icon icon='close'/>
			</Button>
		</ItemBar>
		<Section alt round='bottom'>
			{#if selectedAssets.length === 0}
				<ItemGroup>{$_('collections.selectOneOrMoreAssets')}</ItemGroup>
			{:else if selectedAssets.length === 1}
				<ItemGroup>
					<input disabled type='text' bind:value={selectedAssets[0].uuid}/>
				</ItemGroup>
				<ItemGroup label>
					<input type='text' bind:value={selectedAssets[0].name}/>
					<svelte:fragment slot='label'>
						{$_('asset.name')}
					</svelte:fragment>
				</ItemGroup>
				<ItemGroup label>
					<input type='text' bind:value={selectedAssets[0].originalSource} placeholder={$_('collections.localFile')} />
					<Button title={$_('collections.openFile')} secondary on:click={()=>{openSourceDialog()}}>
						<Icon icon='open'></Icon>
					</Button>
				</ItemGroup>
			{:else}
				<ItemGroup>
					{$_('collections.selectedAssets', {values: {count: selected.length}})}
				</ItemGroup>
			{/if}
		</Section>
	</section>
	{#if selectedAssets.length === 1}
		<DropList tertiary>
			<svelte:fragment slot='heading'>
				{$_('asset.tags')}
			</svelte:fragment>
			<section slot='content' class='selectedAssets__tags__content'>
				<ItemGroup label>
					<input type='text' bind:value={pendingTagValue} on:submit={addTag}/>
					<Button secondary on:click={addTag} title={$_('asset.addTag')}>
						<Icon icon='add'></Icon>
					</Button>
				</ItemGroup>
				{#each selectedAssets[0].tags as tag (tag)}
					<label animate:flip="{{duration: 200}}" class='tag'>
						<input type='text' value={tag}/>
						<Button dangerous on:click={()=>{removeTag(tag)}} title={$_('asset.removeTag')}>
							<Icon icon='remove'></Icon>
						</Button>
					</label>
				{/each}
			</section>
		</DropList>
	{:else if selectedAssets.length > 1}
		<DropList tertiary>
			<svelte:fragment slot='heading'>
				{$_('asset.tags')}
			</svelte:fragment>
			<section slot='content' class='selectedAssets__tags__content'>
				<ItemGroup label>
					<input type='text' bind:value={pendingTagValue} on:submit={addTag}/>
					<Button secondary on:click={addTag} title={$_('asset.addTag')}>
						<Icon icon='add'></Icon>
					</Button>
				</ItemGroup>
				{#if commonTags}
					{#each commonTags as tag (tag)}
						<label animate:flip="{{duration: 200}}" class='tag'>
							<input type='text' value={tag}/>
							<Button dangerous on:click={()=>{removeTag(tag)}} title={$_('asset.removeTag')}>
								<Icon icon='remove'></Icon>
							</Button>
						</label>
					{/each}
				{/if}
			</section>
		</DropList>
	{/if}
</main>

<style>
	section.selection {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		margin: .5em;
	}
	main {
		display: grid;
		grid-template-rows: minmax(0, 1fr) auto;
	}
	.tag {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		padding: 0;
	}
</style>