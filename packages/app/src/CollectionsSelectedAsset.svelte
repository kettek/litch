<script type='ts'>
	import { _ } from 'svelte-i18n'
	import { flip } from 'svelte/animate'
	import type { Asset } from './interfaces/Asset'
	import DropList from "./components/DropList.svelte"
	import { publisher } from './modules'
	import Button from './components/Button.svelte'
	import Icon from './components/Icon.svelte'
	import { createEventDispatcher } from 'svelte'

	export let selectedCollectionUUID: string
	export let selectedAssetUUID: string
	export let selectedAsset: Asset | undefined

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

	/* dispatch */
	const dispatch = createEventDispatcher()

</script>

<article class='selectedAsset'>
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
							<Button secondary on:click={addTag} title={$_('asset.addTag')}>
								<Icon icon='add'></Icon>
							</Button>
						</label>
						{#each selectedAsset.tags as tag (tag)}
							<label animate:flip="{{duration: 200}}" class='selectedAsset__tags__tag'>
								<input type='text' bind:value={tag}/>
								<Button dangerous on:click={()=>{removeTag(tag)}} title={$_('asset.removeTag')}>
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
			<Button dangerous on:click={()=>{dispatch('remove')}}>
				{$_('asset.actions.delete')}
				<Icon icon='close'/>
			</Button>
		</svelte:fragment>
	</DropList>
</article>

<style>
	.selectedAsset {
		display: grid;
		grid-template-rows: minmax(0, 1fr) auto;
	}
	.selectedAsset__source__file {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
	}
	.selectedAsset__tags__tag {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
	}
</style>