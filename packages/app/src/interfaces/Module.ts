import type { BoxInterface } from "./Box"
import type { ActionEventsI } from "./Action"
import type { SvelteComponent } from "svelte/internal"

export interface ModuleDefaultsInterface {
	title?: string
	box?: BoxInterface
	settings: any
	live?: any
}

export interface ModuleInterface {
	uuid: string
	title: string
	instanceComponent?:  new (...args: any[]) => SvelteComponent
	settingsComponent?: new (...args: any[]) => SvelteComponent
	previewComponent?: new (...args: any[]) => SvelteComponent
	liveComponent?:  new (...args: any[]) => SvelteComponent
	defaults: ModuleDefaultsInterface
	locales: Record<string, any>
	//
	triggerEvents?: ModuleTriggerEventsInterface
	actionEvents?: ActionEventsI
}

export interface ModuleTriggerEventsInterface {
	actions: ModuleTriggerActionInterface[]
}

export interface ModuleTriggerActionInterface {
	title: string
	id: string
	ActionComponent: new (...args: any[]) => SvelteComponent
}
