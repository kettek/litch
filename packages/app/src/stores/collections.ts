import type { Asset, Collection } from '../interfaces/Asset'
import { localStore } from './localStore'
import { get } from 'svelte/store'

export function addCollection(o: Collection) {
	collections.update((v: any) => {
		v.push(o)
		return v
	})
}

export function removeCollection(u: string) {
	collections.update((v: any) => {
		v = v.filter((v: Collection)=>v.uuid===u)
		return v
	})
}

export function refreshCollections() {
	collections.set(get(collections))
}

export function addAsset(uuid: string, asset: Asset) {
	let cs = get(collections)
	let c = cs.find((v: any)=>v.uuid === uuid)
	if (!c) return
	c.assets.push(asset)
	collections.set(cs)
}

export const collections = localStore<Collection[]>('collections', [])