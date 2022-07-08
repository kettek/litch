import electron from 'electron'
import type { PublishedMessage } from "@kettek/pubsub/dist/Subscriber"
import { ElectronAuthProvider } from '@twurple/auth-electron'
import { ApiClient } from '@twurple/api'
import { ChatClient } from '@twurple/chat'
import type { SettingsInterface } from '../Settings'
import type { ServiceContext } from '@kettek/litch-app/src/interfaces/Service'

let settings : SettingsInterface

let redirectUri = `http://localhost/nowherefast`
let shouldLogout: boolean
let authProvider: ElectronAuthProvider
let apiClient: ApiClient
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

		if (settings.chatBot.enabled) {
			await startChatbot()
		}

		context.publish('enabled')
		running = true
	} catch(err) {
		context.publish('failed', err)
		running = false
	}
}

export async function disable() {
	try {
		await stopChatbot()
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

	// Start or stop chatbot.
	if (old.chatBot.enabled !== s.chatBot.enabled) {
		if (s.chatBot.enabled) {
			await startChatbot()
		} else {
			await stopChatbot()
		}
	}
	// Resync chatbot settings.
	if (s.chatBot.enabled) {
		// Check for changed channels.
		let newChannels = s.chatBot.channels.filter(ch => !old.chatBot.channels.includes(ch))
		let removedChannels = old.chatBot.channels.filter(ch => !settings.chatBot.channels.includes(ch))

		for (let ch of removedChannels) {
			chatClient.part(ch)
		}
		for (let channel of newChannels) {
			chatClient.join(channel)
			say(channel, `${settings.chatBot.name}'s bones are ready to rumble!`)
		}
	}
}

let chatClient : ChatClient
async function startChatbot() {
	if (chatClient) return
	chatClient = new ChatClient({ authProvider, channels: settings.chatBot.channels })
	chatClient.onConnect(() => {
		console.log('connected')
	})
	chatClient.onMessage((channel, user, msg) => {
		if (settings.dumpAllMessages) {
			console.log('onMessage', channel, user, msg)
		}
		// TODO: what should we actually use as the topic...?
		context.publishToAll('services.chat.message', {
			channel,
			user,
			msg,
		})
		if (msg.startsWith('@'+chatClient.currentNick)) {
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
		}
	})
	chatClient.onRewardGift((e, user, gift, msg) => {
		if (settings.dumpAllMessages) {
			console.log('onRewardGift', e, user, gift, msg)
		}
	})
	chatClient.onAnyMessage(e => {
		if (settings.dumpAllMessages) {
			console.log('dumpAll:', JSON.stringify(e))
		}
	})
	chatClient.onJoin((channel, user) => {
		context.publishToAll('services.chat.join', {
			channel,
			user,
		})
		if (channel.substring(1) === user && user !== chatClient.currentNick) {
			// Greet our lord.
		} else if (user === chatClient.currentNick) {
			if (settings.chatBot.joinMessage) {
				say(channel, `${settings.chatBot.joinMessage}`)
			}
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
		for (let channel of settings.chatBot.channels) {
			say(channel, `${settings.chatBot.leaveMessage}`)
		}
	}
	await chatClient.quit()
	chatClient = null
	console.log('chatbot quit')
}

function say(channel: string, message: string) {
	chatClient.say(channel, `${settings.chatBot.prefix}${message}${settings.chatBot.suffix}`)
}
