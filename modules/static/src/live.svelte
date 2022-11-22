<script type="ts">
	import type { ModuleChannel } from '@kettek/litch-app/src/interfaces/ModuleInstance'
	import type { AssetManager } from '@kettek/litch-app/src/interfaces/Asset'
	import type { SettingsInterface } from './Settings'

	export let channel: ModuleChannel
	export let assets: AssetManager
	export let settings: SettingsInterface

	let port: number = 0
	channel.receive = async ({topic, message}) => {
		console.log('live.receive', topic, message)
		if (topic === 'staticPort') {
			port = message
		}
	}

	function isLocal(p: string) {
		try {
			let url = new URL(p)
			return false
		} catch(err) {
			return true
		}
	}
</script>

<div>
	{#each settings.entries as entry}
		<article style="left: {entry.left}px; top: {entry.top}px; width: {entry.width?entry.width+'px':''}; height: {entry.height?entry.height+'px':''}; {entry.style}">
			{#if entry.sourceType === 'text'}
				<pre style="width: {entry.width?'100%':''}; height: {entry.height?'100%':''};">{entry.source}</pre>
			{:else if entry.sourceType === 'asset'}
				{#if entry.reference?.mimetype?.startsWith('image')}
					<img alt="" src={assets.source(entry.reference)} style="width: {entry.width?'100%':''}; height: {entry.height?'100%':''};"/>
				{:else if entry.reference?.mimetype?.startsWith('video')}
					<video autoplay loop style="width: {entry.width?'100%':''}; height: {entry.height?'100%':''};">
						<track kind="captions"/>
						<source src="{assets.source(entry.reference)}" type="{entry.reference.mimetype}">
					</video>
				{/if}
			{:else if entry.sourceType === 'url'}
				{#if isLocal(entry.source)}
					{#if port > 0}
						<img alt=''  src="http://localhost:{port}{encodeURI(entry.source)}?0" style="width: {entry.width?'100%':''}; height: {entry.height?'100%':''};">
					{/if}
				{:else}
					<img alt='' src="{entry.source}" style="width: {entry.width?'100%':''}; height: {entry.height?'100%':''};">
				{/if}
			{/if}
		</article>

	{/each}
</div>

<style>
	div {
		width: 100%;
		height: 100%;
	}
	article {
		position: absolute;
		overflow: hidden;
	}
</style>