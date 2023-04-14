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

export interface Redeem {
	id: string
	title: string
	image: string
	points: number
}

export interface ServiceData {
	redeems: Redeem[]
}