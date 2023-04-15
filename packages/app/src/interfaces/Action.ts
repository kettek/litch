import type { SvelteComponent } from "svelte"

export interface ActionInterface {
	uuid: string
	type: string
	// action information
	service: string
	id: string
	condition: any
	// trigger information
	triggers: ActionTriggerI[]
}

export type ActionTriggerI = ActionTriggerCoreI | ActionTriggerModuleI

export interface ActionTriggerModuleI {
	type: 'module'
	fulltype: string
	uuid: string
	id: string
	data: string
}
export function isTriggerModule(o: any): o is ActionTriggerModuleI {
	return o.type === 'module'
}

export interface ActionTriggerCoreI {
	type: 'core'
	fulltype: string
	data: ActionTriggerCoreSoundI | ActionTriggerCoreWaitI | ActionTriggerCoreToggleModuleI
}
export function isTriggerCore(o: any): o is ActionTriggerCoreI {
	return o.type === 'core'
}

export interface ActionTriggerCoreToggleModuleI {
	type: 'toggleModule'
	act: 'enable' | 'disable'
	overlay: string
	module: string
}
export function isTriggerCoreToggleModule(o: any): o is ActionTriggerCoreToggleModuleI {
	return o.type === 'toggleModule'
}

export interface ActionTriggerCoreSoundI {
	type: 'playSound'
	collection: string
	asset: string
	volume: number
	wait: boolean
}
export function isTriggerCoreSound(o: any): o is ActionTriggerCoreSoundI {
	return o.type === 'playSound'
}

export interface ActionTriggerCoreWaitI {
	type: 'wait'
	seconds: number
}
export function isTriggerCoreWait(o: any): o is ActionTriggerCoreWaitI {
	return o.type === 'wait'
}

export const TriggerCoreTypes = [
	'playSound',
	'wait',
	'toggleModule',
]

export interface ActionEventsI {
	conditions: ActionEventI[]
}

export interface ActionEventI {
	title: string
	id: any
	ConditionComponent: SvelteComponent
}