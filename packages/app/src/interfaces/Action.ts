import type { SvelteComponent } from "svelte"

export interface ActionInterface {
	uuid: string
	title: string
	triggers: ActionTriggerI[]
}

export interface ActionServiceI extends ActionInterface {
	type: 'service'
	service: string
	id: string
	condition: any
}
export function isActionService(o: any): o is ActionServiceI {
	return o.type === 'service'
}

export interface ActionCoreHotkeyI extends ActionInterface {
	type: 'core'
	id: 'hotkey'
	local: boolean
	keys: string
}
export function isActionCoreHotkey(o: any): o is ActionCoreHotkeyI {
	return o.type === 'core' && o.id === 'hotkey'
}

export type ActionI = ActionServiceI | ActionCoreHotkeyI

export type ActionTriggerI = ActionTriggerCoreI | ActionTriggerModuleI

export interface ActionTriggerCoreI {
	type: 'core'
	fulltype: string
	data: ActionTriggerCoreTypes
}
export function isTriggerCore(o: any): o is ActionTriggerCoreI {
	return o.type === 'core'
}

export type ActionTriggerCoreTypes = ActionTriggerCoreSoundI | ActionTriggerCoreWaitI | ActionTriggerCoreToggleModuleI | ActionTriggerCoreStoreModuleI | ActionTriggerCoreStoreOverlayI

export interface ActionTriggerCoreToggleModuleI {
	type: 'toggleModule'
	act: 'enable' | 'disable'
	overlay: string
	module: string
}
export function isTriggerCoreToggleModule(o: any): o is ActionTriggerCoreToggleModuleI {
	return o.type === 'toggleModule'
}

export interface ActionTriggerCoreStoreModuleI {
	type: 'storeModule'
	act: 'store' | 'restore'
	overlay: string
	module: string
}
export function isTriggerCoreStoreModule(o: any): o is ActionTriggerCoreStoreModuleI {
	return o.type === 'storeModule'
}

export interface ActionTriggerCoreStoreOverlayI {
	type: 'storeOverlay'
	act: 'store' | 'restore'
	overlay: string
}
export function isTriggerCoreStoreOverlay(o: any): o is ActionTriggerCoreStoreOverlayI {
	return o.type === 'storeOverlay'
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
	'storeModule',
	'storeOverlay',
]

export interface ActionTriggerModuleI {
	type: 'module'
	moduleUUID: string
	triggerID: string
	fulltype: string
	//
	overlayUUID: string
	moduleInstanceUUID: string
	data: any
}
export function isTriggerModule(o: any): o is ActionTriggerModuleI {
	return o.type === 'module'
}

export interface ActionEventsI {
	conditions: ActionEventI[]
}

export interface ActionEventI {
	title: string
	id: any
	ConditionComponent: SvelteComponent
	TitleComponent?: SvelteComponent
	payload?: Object
}
