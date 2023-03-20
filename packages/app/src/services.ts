import type { PublishedMessage } from "@kettek/pubsub/dist/Subscriber"

import type { ServiceChannel, ServicesChannel } from "./interfaces/Service"

import { publisher } from './modules'

import { get } from 'svelte/store'
import { refreshServices, services } from './stores/services'

export function createServiceChannel(uuid: string): ServiceChannel {
	let ctx = `service.${uuid}`
	let s = publisher.subscribe(`${ctx}.*`)

	let m = {
		handler: async (msg: any) => {
			// strip the topics
			msg = {
				...msg,
				sourceTopic: msg.sourceTopic.substring(ctx.length+1),
				topic: msg.sourceTopic.substring(ctx.length+1),
			}
			await m.receive(msg)
		},
		receive: async (msg: PublishedMessage) => {
			// To be overridden by the module.
		},
		publish: async (topic: string, msg: any) => {
			//publisher.publish(s, `${ctx}.${topic}`, msg)
			// FIXME
			await publisher.publish(`${ctx}.${topic}`, msg)
		},
		subscribe: (topic: string): ()=>void => {
			// TODO: Limit topics to subscribe to
			publisher.subscribe(topic, s)
			return () => {
				publisher.unsubscribe(topic, s)
			}
		},
		unsubscribe: (topic?: string) => {
			if (topic === undefined) {
				publisher.unsubscribe(s)
			} else {
				publisher.unsubscribe(topic, s)
			}
		},
		update: (topic: string, msg: any) => {
			// OVERRIDE
		}
	}

	s.handler = m.handler

	return m
}

export function createServicesChannel(): ServicesChannel {
	let ctx = `services`
	let s = publisher.subscribe(`${ctx}.*`)

	let m = {
		handler: async (msg: any) => {
			// strip the topics
			msg = {
				...msg,
				sourceTopic: msg.sourceTopic.substring(ctx.length+1),
				topic: msg.sourceTopic.substring(ctx.length+1),
			}
			await m.receive(msg)
		},
		receive: async (msg: PublishedMessage) => {
			// To be overridden by the module.
		},
		subscribe: (topic: string): ()=>void => {
			publisher.subscribe(topic, s)
			return () => {
				publisher.unsubscribe(topic, s)
			}
		},
		unsubscribe: (topic?: string) => {
			if (topic === undefined) {
				publisher.unsubscribe(s)
			} else {
				publisher.unsubscribe(topic, s)
			}
		},
		update: (topic: string, msg: any) => {
			// OVERRIDE
		}
	}

	s.handler = m.handler

	return m
}



// Add various subscriptions for managing service enable/disable/reload
function getUUIDFromTopic(topic: string) {
	let split = topic.split('.')
	if (split.length < 2) {
		return ''
	}
	return split[1]
}
function getServiceFromTopic(topic: string) {
	let uuid = getUUIDFromTopic(topic)
	return get(services).find(v=>v.uuid === uuid)
}
publisher.subscribe('service.*.reload', async ({topic, sourceTopic}) => {
	if (!sourceTopic) return
	let uuid = getUUIDFromTopic(sourceTopic)
	publisher.publish(`service.${uuid}.disable`, {})
	publisher.publish(`service.${uuid}.enable`, {})
})
publisher.subscribe('service.*.enable', async ({topic, sourceTopic}) => {
	if (!sourceTopic) return
	let service = getServiceFromTopic(sourceTopic)
	if (service) {
		service.pending = true
		refreshServices()
	}
})
publisher.subscribe('service.*.disable', async ({topic, sourceTopic}) => {
	if (!sourceTopic) return
	let service = getServiceFromTopic(sourceTopic)
	if (service) {
		service.pending = false
		refreshServices()
	}
})
publisher.subscribe('service.*.enabled', async ({topic, sourceTopic}) => {
	if (!sourceTopic) return
	let service = getServiceFromTopic(sourceTopic)
	if (service) {
		service.enabled = true
		service.pending = false
		refreshServices()
	}
})
publisher.subscribe('service.*.disabled', async ({topic, sourceTopic}) => {
	if (!sourceTopic) return
	let service = getServiceFromTopic(sourceTopic)
	if (service) {
		service.enabled = false
		service.pending = false
		refreshServices()
	}
})
publisher.subscribe('service.*.failed', async ({topic, sourceTopic}) => {
	if (!sourceTopic) return
	let service = getServiceFromTopic(sourceTopic)
	if (service) {
		service.enabled = false
		service.pending = false
		refreshServices()
	}
})
