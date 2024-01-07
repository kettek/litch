<script type='ts'>
	import { onMount } from "svelte"
	import type { ModuleChannel } from "@kettek/litch-app/src/interfaces/ModuleInstance"
  import type { Bouncer, SettingsInterface } from "./SettingsI"
	import { upgrade } from './upgrade'
  import type { Asset, AssetManager } from "@kettek/litch-app/src/interfaces/Asset"
	import DD from 'dot-dotty'

	export let channel: ModuleChannel
	export let settings: SettingsInterface
	export let assets: AssetManager

	export let update: (v: any) => void

	let [changed, settings_] = upgrade(settings)
	if (changed) {
		update(settings_)
	}
	
	// Republish the static server port on new live view.
	channel.receive = async ({topic, message}) => {
		if (topic === 'refresh') {
			//
		} else if (topic.startsWith('trigger.')) {
			let triggerID = topic.split('.')[1]
			if (triggerID === 'add') {
				let collection = assets.collectionAssets(message.trigger.targetCollection)
				if (!collection) return

				let title: string
				let color: string
				let id: string
				let assetName: string

				let dot = DD(message.action)
				if (message.trigger.targetTitle) {
					title = message.trigger.targetTitle.replace(/\{([^\}]+)\}/g, (match, key) => {
						return dot[key]
					})
					if (message.trigger.targetTitleColor) {
						color = message.trigger.targetTitleColor.replace(/\{([^\}]+)\}/g, (match, key) => {
							return dot[key]
						})
					}
				}
				if (message.trigger.uniqueID) {
					id = message.trigger.uniqueID.replace(/\{([^\}]+)\}/g, (match, key) => {
						return dot[key]
					})
				}
				if (message.trigger.targetAsset) {
					assetName = message.trigger.targetAsset.replace(/\{([^\}]+)\}/g, (match, key) => {
						return dot[key]
					})
				}
				
				let asset: Asset
				if (assetName) {
					asset = collection.find(a => a.name === assetName)
				}
				if (!asset) {
					asset = collection[Math.floor(Math.random()*collection.length)]
				}
				let bouncer: Bouncer = {
					reference: {
						collection: message.trigger.targetCollection,
						asset: asset.uuid,
						mimetype: asset.mimetype,
						name: asset.name,
					},
					temporary: true,
				}
				if (title) {
					bouncer.title = title
					if (color) {
						bouncer.titleColor = color
					} else {
						bouncer.titleColor = '#'+Math.floor(Math.random()*16777215).toString(16)
					}
					console.log('set bouncer', bouncer.titleColor)
				}
				if (id) {
					bouncer.id = id
					let indexOf = settings.bouncers.findIndex(b => b.id === id)
					if (indexOf !== -1) {
						settings.bouncers[indexOf] = bouncer
					} else {
						settings.bouncers.push(bouncer)
					}
				} else {
					settings.bouncers.push(bouncer)
				}
				update(settings)
			} else if (triggerID === 'clearTemp') {
				settings.bouncers = settings.bouncers.filter(b => !b.temporary)
				update(settings)
			}
		}
	}

	onMount(() => {
		return () => {
		}
	})
</script>