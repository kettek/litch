export interface SettingsInterface {
	clientID: string
	chatBot: {
		enabled: boolean
		name: string
		prefix: string
		suffix: string
		channels: string[]
		openChannels: boolean
		joinMessage: string
		leaveMessage: string
	}
}
