import type { SvelteComponent } from "svelte"
import type { Subscriber, SubscriberHandler } from '@kettek/pubsub/dist/Subscriber'
import type { Publisher } from "@kettek/pubsub/dist/Publisher"
import type { ActionEventsI } from "./Action"
import type { ModuleTriggerActionInterface } from "./Module"

export interface ServiceSourceInterface {
	uuid: string
	version: string
	dir: string
	main: string
	render: string
}

export interface ServiceTriggerEventsInterface {
	actions: ModuleTriggerActionInterface[]
}

/**
 * ServiceInterface provides the generic interface for services.
 */
export interface ServiceInterface {
	// UUID
	uuid: string
	// Friendly name.
	title: string
	//
	enabled: boolean
	// Whether the service is in the process of enabling or disabling.
	pending: boolean
	// Channel is used to manage service<->module passing.
	channel: ServiceChannel
	// Settings is stored to disk.
	settings: {[key: string]: any}
	// InstanceComponent provides the component of the service that runs when the service is loaded.
	InstanceComponent: SvelteComponent
	// SettingsComponent provides the component used for the service's settings page.
	SettingsComponent: SvelteComponent
	//
	locales: Record<string, any>
	//
	actionEvents: ActionEventsI
	// FIXME: Make the type here a universal one.
	triggerEvents?: ServiceTriggerEventsInterface
	// data is the "live" data used by the service. It is shared between the instance and any actionEvent components.
	data: any
	//
	defaults: {
		settings: {[key: string]: any}
	}
}

export interface ServiceMainInterface {
	load?: (settings: any) => Promise<void>
	enable?: () => Promise<void>
	disable?: () => Promise<void>
	receive?: (msg: any) => Promise<any>
	send?: (msg: any) => Promise<any>
}

export interface ServiceChannel {
	handler: SubscriberHandler
	receive: (msg: any) => Promise<void>
	publish: (topic: string, msg: any) => Promise<void>
	subscribe: (topic: string) => () => void
	unsubscribe: (topic?: string) => void
}

export interface ServicesChannel {
	handler: SubscriberHandler
	receive: (msg: any) => Promise<void>
	subscribe: (topic: string) => () => void
	unsubscribe: (topic?: string) => void
}

export interface ServiceContext {
	publisher?: Publisher
	subscriber?: Subscriber
	publish?: (topic: string, msg?: any) => Promise<void> // publishes within the service's context. The sending topic equates to `service.<UUID>.<topic>`.
	publishToAll?: (topic: string, msg?: any) => Promise<void> // publishes a topic to all topic subscribers. The sending equates to `<topic>`.
}
