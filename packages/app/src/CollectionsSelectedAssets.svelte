<script lang="ts">
	import { _ } from 'svelte-i18n'
	import DropList from "./components/DropList.svelte"
	import Button from './components/Button.svelte'
	import Icon from './components/Icon.svelte'
	import type { Collection } from './interfaces/Asset'
	import { flip } from 'svelte/animate'

	import { refreshCollections } from './stores/collections'

	export let selected: string[] = []
	export let collection: Collection | undefined

	$: selectedAssets = collection?.assets.filter(v=>selected.find(v2=>v.uuid===v2))
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

</script>

<main>
	<DropList tertiary>
		<svelte:fragment slot="heading">
			{$_('collections.selectedAssets')}
		</svelte:fragment>
		<svelte:fragment slot="content">
			<label>
				<input disabled type='text' value={selected.length}/>
				<span>selected assets</span>
			</label>
			<section class='selectedAssets__tags'>
					<header>{$_('asset.tags')}</header>
					<section class='selectedAssets__tags__content'>
						<label class='selectedAsset__tags__tag'>
							<input type='text' bind:value={pendingTagValue} on:submit={addTag}/>
							<Button secondary on:click={addTag} title={$_('asset.addTag')}>
								<Icon icon='add'></Icon>
							</Button>
						</label>
						{#if commonTags}
							{#each commonTags as tag (tag)}
								<label animate:flip="{{duration: 200}}" class='selectedAsset__tags__tag'>
									<input type='text' value={tag}/>
									<Button dangerous on:click={()=>{removeTag(tag)}} title={$_('asset.removeTag')}>
										<Icon icon='remove'></Icon>
									</Button>
								</label>
							{/each}
						{/if}
					</section>
			</section>
		</svelte:fragment>
	</DropList>
	tags here
</main>

<style>
</style>