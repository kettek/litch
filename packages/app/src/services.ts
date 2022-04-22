import type { PublishedMessage } from "@kettek/pubsub/dist/Subscriber"

import type { ServiceChannel } from "./interfaces/Service"

import { publisher } from './modules'

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
			console.log("servicve publish", ctx, topic, msg)
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
