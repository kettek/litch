import type { PublishedMessage } from "@kettek/pubsub/dist/Subscriber"
import type { SettingsInterface } from '../Settings'
import type { ServiceContext } from '@kettek/litch-app/src/interfaces/Service'

let settings : SettingsInterface

export let context: ServiceContext = {}


export async function enable() {
	/*context.publisher.subscribe('services.*', async (m: any) => {
	})*/
	/*context.publisher.subscribe('chat.*', async (m: any) => {
		console.log('chat', m)
	})*/

	try {
		context.publish('enabled')
	} catch(err) {
		context.publish('failed', err)
	}
}

export async function disable() {
	context.publish('disabled')
}

export async function receive(msg: PublishedMessage) {
	console.log('bot svc receive', msg)
	if (msg.topic === 'update') {
		await syncSettings(msg.message as SettingsInterface)
	}
}

async function syncSettings(s : SettingsInterface) {
	let old = settings
	settings = s

	//console.log('sync', s, 'to', old)
}
