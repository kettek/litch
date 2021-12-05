// ugh
const { Publisher: PublisherR } = require('@kettek/pubsub')
import type { Publisher } from "@kettek/pubsub/dist/Publisher"
import type { PublishedMessage } from "@kettek/pubsub/dist/Subscriber"

import type { ModuleChannel } from "./interfaces/ModuleInstance"

export let publisher: Publisher = new PublisherR()

export function createModuleChannel(overlayUUID: string, uuid: string): ModuleChannel {
	let ctx = `overlay.${overlayUUID}.module.${uuid}`
	let s = publisher.subscribe(`${ctx}.*`)
	// Subscribe to assets.
	publisher.subscribe(`overlay.${overlayUUID}.assets.*`)

	let m = {
		handler: async (msg: any) => {
			await m.receive(msg)
		},
		receive: async (msg: PublishedMessage) => {
			// To be overridden by the module.
		},
		publish: (topic: string, msg: any) => {
			publisher.publish(s, `${ctx}.${topic}`, msg)
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
	}

	s.handler = m.handler

	return m
}
