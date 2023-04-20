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
	keys: string
}
export function isActionCoreHotkey(o: any): o is ActionCoreHotkeyI {
	return o.type === 'core' && o.id === 'hotkey'
}

export type ActionI = ActionServiceI | ActionCoreHotkeyI

export type ActionTriggerI = ActionTriggerCoreI

export interface ActionTriggerCoreI {
	type: 'core'
	fulltype: string
	data: ActionTriggerCoreTypes
}
export function isTriggerCore(o: any): o is ActionTriggerCoreI {
	return o.type === 'core'
}

export type ActionTriggerCoreTypes = ActionTriggerCoreSoundI | ActionTriggerCoreWaitI | ActionTriggerCoreToggleModuleI | ActionTriggerCoreTriggerModuleI

export interface ActionTriggerCoreToggleModuleI {
	type: 'toggleModule'
	act: 'enable' | 'disable'
	overlay: string
	module: string
}
export function isTriggerCoreToggleModule(o: any): o is ActionTriggerCoreToggleModuleI {
	return o.type === 'toggleModule'
}

export interface ActionTriggerCoreTriggerModuleI {
	type: 'triggerModule'
	overlay: string
	module: string
	id: string
	trigger: any
}
export function isTriggerCoreTriggerModule(o: any): o is ActionTriggerCoreTriggerModuleI {
	return o.type === 'triggerModule'
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
	'triggerModule',
]

export interface ActionEventsI {
	conditions: ActionEventI[]
}

export interface ActionEventI {
	title: string
	id: any
	ConditionComponent: SvelteComponent
	TitleComponent?: SvelteComponent
}
