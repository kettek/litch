//const { ElectronAuthProvider } = require('@twurple/auth-electron')
import type { Express, Application, NextFunction, Request, Response } from 'express'
import type { Server } from 'http'
const express = require('express')
import type { PublishedMessage } from "@kettek/pubsub/dist/Subscriber"
import { ElectronAuthProvider } from '@twurple/auth-electron'
import { ApiClient } from '@twurple/api'
import { ChatClient } from '@twurple/chat'
import type { SettingsInterface } from '../Settings'

let settings : SettingsInterface

let port = '8099'
let redirectUri = `http://localhost:${port}/login`
let loginServer : Express
let loginApp : Server
let shouldLogout: boolean
let authProvider : ElectronAuthProvider
let apiClient : ApiClient

export async function load() {
	console.log('load')
}

export async function enable() {
	// Spin up login service.
	loginServer = express()

	loginServer.get('/login', (req, res) => {
		console.log('oh snap', req, res)
	})

	loginServer.get('/', (req, res) => {
		console.log('oh root', req, res)
	})


	loginApp = loginServer.listen(port, () => {
		console.log('twitch listening')
	})

	authProvider = new ElectronAuthProvider({
		clientId: settings.clientID,
		redirectUri: redirectUri,
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

	console.log('enable')
}

export async function disable() {
	await new Promise((resolve, reject) => {
		if (!loginApp || !loginApp.listening) {
			resolve({})
			return
		}
		loginApp.close(() => {
			resolve({})
		})
	})
	await stopChatbot()
	console.log('disable')
}

//export async function receive(msg: any) {
export async function receive(msg: PublishedMessage) {
	console.log('recv', msg)
	if (msg.topic === 'update') {
		await syncSettings(msg.message as SettingsInterface)
	} else if (msg.topic === 'logout') {
		shouldLogout = true
		await disable()
		await enable()
	} else if (msg.topic === 'say') {
		if (chatClient) {
			console.log('say', msg.message)
			chatClient.say(msg.message.channel, msg.message.message)
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
			chatClient.say(channel, `${settings.chatBot.prefix}${settings.chatBot.name}'s bones are ready to rumble!${settings.chatBot.suffix}`)
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
					chatClient.say(channel, `Results: ${results.join(', ')}`)
					if (crits === 1) {
						chatClient.say(channel, `Wow, you got ${crits} crits!`)
					} else if (crits > 1) {
						chatClient.say(channel, `Wow, you got a crit!`)
					}
				}
			}
		}
	})
	chatClient.onAnyMessage(e => {
		//console.log('any message', e)
	})
	chatClient.onJoin((channel, user) => {
		if (channel.substring(1) === user && user !== chatClient.currentNick) {
			// Greet our lord.
		} else if (user === chatClient.currentNick) {
			if (settings.chatBot.joinMessage) {
				chatClient.say(channel, `${settings.chatBot.prefix}${settings.chatBot.joinMessage}${settings.chatBot.suffix}`)
			}
		}
	})
	chatClient.onJoinFailure((channel, reason) => {
		console.log("join failure", channel, reason)
	})
	chatClient.onPart((channel, user) => {
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
			chatClient.say(channel, `${settings.chatBot.prefix}${settings.chatBot.leaveMessage}${settings.chatBot.suffix}`)
		}
	}
	await chatClient.quit()
	chatClient = null
	console.log('chatbot quit')
}