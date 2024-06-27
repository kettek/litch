import type { SvelteComponent } from "svelte"
import type { BoxInterface } from "./Box"

export interface ModuleDefaultsInterface {
	title: string
	box: BoxInterface
	settings: any
	live: any
}

export interface ModuleInterface {
	uuid: string
	title: string
	instanceComponent?: SvelteComponent
	settingsComponent?: SvelteComponent
	previewComponent?: SvelteComponent
	liveComponent?: SvelteComponent
	defaults: ModuleDefaultsInterface
	locales: Record<string, any>
	//
	eventTriggers?: ModuleEventTriggersInterface
}

export interface ModuleEventTriggersInterface {
	actions: ModuleTriggerActionInterface[]
}

export interface ModuleTriggerActionInterface {
	title: string
	id: string
	ActionComponent: SvelteComponent
}