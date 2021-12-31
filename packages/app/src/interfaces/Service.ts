import type { SvelteComponent } from "svelte"
import type { SubscriberHandler } from '@kettek/pubsub/dist/Subscriber'

/**
 * ServiceInterface provides the generic interface for services.
 */
export interface ServiceInterface {
	// UUID
	uuid: string
	// Friendly name.
	title: string
	// Channel is used to manage service<->module passing.
	channel: ServiceChannel
	// Settings is stored to disk.
	settings: {[key: string]: any}
	// InstanceComponent provides the component of the service that runs when the service is loaded.
	InstanceComponent: SvelteComponent
	// SettingsComponent provides the component used for the service's settings page.
	SettingsComponent: SvelteComponent
	main?: ServiceMainInterface
	//
	locales: Record<string, any>
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