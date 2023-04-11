import electron from 'electron'
import type { PublishedMessage } from "@kettek/pubsub/dist/Subscriber"
import { ElectronAuthProvider } from '@twurple/auth-electron'
import { ApiClient } from '@twurple/api'
import { ChatClient, ChatRaidInfo, ChatSubInfo, UserNotice } from '@twurple/chat'
import { PubSubBitsMessage, PubSubClient } from '@twurple/pubsub'
import type { SingleUserPubSubClient } from '@twurple/pubsub/lib/SingleUserPubSubClient'
import type { PubSubSubscriptionMessage } from '@twurple/pubsub/lib/messages/PubSubSubscriptionMessage'
import type { PubSubRedemptionMessage } from '@twurple/pubsub/lib/messages/PubSubRedemptionMessage'
import type { SettingsInterface } from '../Settings'
import type { ServiceContext } from '@kettek/litch-app/src/interfaces/Service'

let settings : SettingsInterface

let redirectUri = `http://localhost/nowherefast`
let shouldLogout: boolean
let authProvider: ElectronAuthProvider
let pubSubClient: PubSubClient
let pubSubUser: SingleUserPubSubClient
let apiClient: ApiClient
let userID: string
let running: boolean

export let context: ServiceContext = {}

export async function enable() {
	try {
		authProvider = new ElectronAuthProvider({
			clientId: settings.clientID,
			redirectUri: redirectUri,
		}, {
			windowOptions: {
				width: 400,
				height: 600,
				center: true,
				parent: electron.BrowserWindow.getAllWindows()[0], // Is this a safe assumption...?
				show: false,
				modal: true,
				autoHideMenuBar: true,
				webPreferences: {
					devTools: false,
					nodeIntegration: false,
				}
			}
		})

		if (shouldLogout) {
			authProvider.allowUserChange()
			authProvider.getAccessToken(authProvider.currentScopes)
			shouldLogout = false
		}

		apiClient = new ApiClient({ authProvider })

		await startPubsub()
		await startChatbot()

		context.publish('enabled')
		running = true
	} catch(err) {
		console.log(err)
		context.publish('failed', err)
		running = false
	}
}

export async function disable() {
	try {
		await stopChatbot()
		await stopPubsub()
	} catch(err) {
		context.publish('failed', err)
	}
	running = false
	context.publish('disabled')
}

//export async function receive(msg: any) {
export async function receive(msg: PublishedMessage) {
	if (msg.topic === 'update') {
		await syncSettings(msg.message as SettingsInterface)
	} else if (msg.topic === 'logout') {
		shouldLogout = true
		if (running) {
			context.publish('reload')
		}
	} else if (msg.topic === 'say') {
		if (chatClient) {
			say(msg.message.channel, `${msg.message.message}`)
		}
	}
}

async function syncSettings(s : SettingsInterface) {
	let old = settings
	settings = s

	if (old.channel !== s.channel) {
		await stopPubsub()
		await startPubsub()

		await startChatbot()
		await stopChatbot()
	}
}

let chatClient : ChatClient
async function startChatbot() {
	if (chatClient) return
	chatClient = new ChatClient({ authProvider, channels: [settings.channel] })
	chatClient.onConnect(() => {
		console.log('connected')
	})
	chatClient.onMessage((channel, user, msg) => {
		if (settings.dumpAllMessages) {
			console.log('onMessage', channel, user, msg)
		}
		// TODO: what should we actually use as the topic...?
		context.publishToAll('services.twitch.message', {
			channel,
			user,
			msg,
		})
		/*if (msg.startsWith('@'+chatClient.currentNick)) {
			msg = msg.substring(chatClient.currentNick.length+1).trimStart().trimEnd()
			if (msg.startsWith('roll ')) {
				let results = []
				let rolls = msg.split(' ').slice(1)
				let crits = 0
				for (let roll of rolls) {
					let parts = roll.split('d')
					let dice = 1
					let pips = 0
					if (parts.length === 1) {
						pips = parseInt(parts[0], 10)
					} else {
						dice = parseInt(parts[0], 10)
						pips = parseInt(parts[1], 10)
					}
					for (let d = 0; d < dice; d++) {
						results.push(Math.floor(Math.random()*pips)+1)
						if ((pips === 100 || pips === 20) && results[results.length-1] === pips) {
							crits++
						}
					}
				}
				if (results.length > 0) {
					say(channel, `Results: ${results.join(', ')}`)
					if (crits === 1) {
						say(channel, `Wow, you got a crit!`)
					} else if (crits > 1) {
						say(channel, `Wow, you got ${crits} crits!`)
					}
				}
			}
		}*/
	})
	chatClient.onRaid((channel: string, user: string, raidInfo: ChatRaidInfo, msg: UserNotice) => {
		if (settings.dumpAllMessages) {
			console.log('onRaid', channel, user, raidInfo, msg)
		}
	})
	chatClient.onSub((channel: string, user: string, subInfo: ChatSubInfo, msg: UserNotice) => {
		if (settings.dumpAllMessages) {
			console.log('onSub', channel, user, subInfo, msg)
		}
	})
	chatClient.onRewardGift((e, user, gift, msg) => {
		if (settings.dumpAllMessages) {
			console.log('onRewardGift', e, user, gift, msg)
		}
	})
	chatClient.onMessage(e => {
		if (settings.dumpAllMessages) {
			console.log('dumpAll:', JSON.stringify(e))
		}
	})
	chatClient.onJoin((channel, user) => {
		console.log('join', channel, user)
		context.publishToAll('services.chat.join', {
			channel,
			user,
		})
		if (settings.chatBot.joinMessage) {
			say(channel, `${settings.chatBot.joinMessage}`)
		}
	})
	chatClient.onJoinFailure((channel, reason) => {
		console.log("join failure", channel, reason)
	})
	chatClient.onPart((channel, user) => {
		context.publishToAll('services.chat.part', {
			channel,
			user,
		})
		console.log("parted", channel, user)
	})
	await chatClient.connect()
	console.log(chatClient)
	console.log('chatbot is up...')
}

async function stopChatbot() {
	if (!chatClient) return
	if (settings.chatBot.leaveMessage) {
		if (settings.channel != null) {
			say(settings.channel, `${settings.chatBot.leaveMessage}`)
		}
	}
	await chatClient.quit()
	chatClient = null
	console.log('chatbot quit')
}

async function startPubsub() {
	if (pubSubClient) return
	pubSubClient = new PubSubClient()

	if (settings.channel !== '') {
		const user = await apiClient.users.getUserByName(settings.channel)
		userID = await pubSubClient.registerUserListener(authProvider, user.id)
		console.log('pubsub registered with', settings.channel, userID)
	} else {
		userID = await pubSubClient.registerUserListener(authProvider)
	}

	pubSubUser = pubSubClient.getUserListener(userID)

	pubSubUser.onBits((message: PubSubBitsMessage) => {
		console.log('bits', message)
	})
	pubSubUser.onSubscription((message: PubSubSubscriptionMessage) => {
		console.log('subscription', message)
	})
	pubSubUser.onRedemption((message: PubSubRedemptionMessage) => {
		console.log('got redemption', message)
	})
}

async function stopPubsub() {
	if (!pubSubClient) return
		
	await pubSubUser.removeAllListeners()
		
	pubSubClient = null
	pubSubUser = null
}

function say(channel: string, message: string) {
	chatClient.say(channel, `${settings.chatBot.prefix}${message}${settings.chatBot.suffix}`)
}
