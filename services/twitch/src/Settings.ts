export interface SettingsInterface {
	clientID: string
	channel: string
	dumpAllMessages: boolean
	chatBot: {
		name: string
		prefix: string
		suffix: string
		joinMessage: string
		leaveMessage: string
	}
}
