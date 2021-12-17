import type { Asset, Collection } from '../interfaces/Asset'
import { localStore } from './localStore'
import { get } from 'svelte/store'
import { v4 } from 'uuid'

export function addCollection(o: Collection) {
	collections.update((v: any) => {
		v.push(o)
		return v
	})
}

export function removeCollection(uuid: string) {
	let cs = get(collections)
	cs = cs.filter((v: Collection) => v.uuid !== uuid)
	collections.set(cs)
}

export function refreshCollections() {
	collections.set(get(collections))
}

export function duplicateCollection(uuid: string) {
	let cs = get(collections)
	let c = cs.find((v: any)=>v.uuid === uuid)
	if (!c) return
	let c2 = JSON.parse(JSON.stringify(c)) // FIXME: Replace with clone
	c2.uuid = v4()
	cs.push(c2)
	collections.set(cs)
}

export function addAsset(uuid: string, asset: Asset) {
	let cs = get(collections)
	let c = cs.find((v: any)=>v.uuid === uuid)
	if (!c) return
	c.assets.push(asset)
	collections.set(cs)
}

export function removeAsset(collectionUUID: string, assetUUID: string) {
	let cs = get(collections)
	let c = cs.find((v: any)=>v.uuid === collectionUUID)
	if (!c) return
	c.assets = c.assets.filter(v=>v.uuid !== assetUUID)
	collections.set(cs)
}

export const collections = localStore<Collection[]>('collections', [])