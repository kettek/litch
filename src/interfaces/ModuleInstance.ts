import type { Publisher } from '@kettek/pubsub/dist/Publisher'
import type { SubscriberHandler } from '@kettek/pubsub/dist/Subscriber'
import type { AssetManager } from './Asset'
import type { BoxInterface } from './Box'

/**
 * ModuleInstanceInterface is an instance of a module.
 */
export interface ModuleInstanceInterface {
	title: string // user-defined friendly title
	uuid: string // used to identify this module
	box: BoxInterface // used to size module instance component
	moduleUUID: string // UUID Reference to the associated module
	settings: {[key: string]: any} // Passed to module
	openDimensions: boolean
	openSettings: boolean
	active: boolean
	// Live
	channel: ModuleChannel
	assets: AssetManager
}

export interface ModuleChannel {
	handler: SubscriberHandler
	receive: (msg: any) => Promise<void>
	publish: (topic: string, msg: any) => void
	subscribe: (topic: string) => () => void
}
