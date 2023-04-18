import { v4 } from 'uuid'
import type { ActionI } from '../interfaces/Action'
import { localStore } from "./localStore"
import { get } from 'svelte/store'

export function addAction(s: ActionI) {
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

export function duplicateAction(uuid: string) {
	let as = get(actions)
	let a = as.find((v: any)=>v.uuid === uuid)
	if (!a) return
	let a2 = JSON.parse(JSON.stringify(a)) // FIXME: Replace with clone
	a2.uuid = v4()
	as.push(a2)
	actions.set(as)
}

export function refreshActions() {
	actions.set(get(actions))
}

function deserializeActions() {
	let aa = get(actions)
	// TODO: Optional deserialization
	actions.set(aa)
}

export const actions = localStore<ActionI[]>('actions', [])

deserializeActions()