import type { SvelteComponent } from "svelte"

export interface ActionInterface {
	uuid: string
	service: string
	id: string
	condition: any
}

export interface ActionEventsI {
	conditions: ActionEventI[]
}

export interface ActionEventI {
	title: string
	id: any
	ConditionComponent: SvelteComponent
}
