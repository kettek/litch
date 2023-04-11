export interface SettingsInterface {
	clientID: string
	user: string
	dumpAllMessages: boolean
	chatBot: {
		name: string
		prefix: string
		suffix: string
		joinMessage: string
		leaveMessage: string
	}
}
