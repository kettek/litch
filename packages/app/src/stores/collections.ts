import type { Asset, Collection } from '../interfaces/Asset'
import { localStore } from './localStore'

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
	collections.update((v: any) => {
		return v
	})
}

export function addAsset(uuid: string, asset: Asset) {
	collections.update((v: any) => {
		let collection = v.find((v2: any)=>v2.uuid === uuid)
		if (collection) {
			collection.assets.push(asset)
		}
		return v
	})
}

export const collections = localStore<Collection[]>('collections', [])