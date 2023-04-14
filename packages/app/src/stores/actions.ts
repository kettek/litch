import type { ActionInterface } from '../interfaces/Action'
import { localStore } from "./localStore"
import { get } from 'svelte/store'

export function addAction(s: ActionInterface) {
	actions.update((v: any) => {
		let existing = v.findIndex((v2: any) => v2.uuid === s.uuid)
		if (existing !== -1) {
			v[existing] = {
				...v[existing],
				...s,
			}
		} else {
			v.push({
				...s,
			})
		}
		return v
	})
}

export function removeAction(uuid: string) {
	actions.update((v: any) => v.filter((v2: any)=>v2.uuid!==uuid))
}

export function refreshActions() {
	actions.set(get(actions))
}

function deserializeActions() {
	let aa = get(actions)
	// TODO: Optional deserialization
	actions.set(aa)
}

export const actions = localStore<ActionInterface[]>('actions', [])

deserializeActions()