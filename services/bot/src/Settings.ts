export interface SettingsInterface {
	clientID: string
	bots: [{
		enabled: boolean
		name: string
		prefix: string
		suffix: string
		channels: string[]
		openChannels: boolean
		joinMessage: string
		leaveMessage: string
	}]
}
