import SettingsComponent from './settings.svelte'
import InstanceComponent from './instance.svelte'
import RedeemCondition from './RedeemCondition.svelte'
import RedeemTitle from './RedeemTitle.svelte'
import RaidCondition from './RaidCondition.svelte'
import ChatCondition from './ChatCondition.svelte'
import en from '../locales/en.json'
import ChatAction from './ChatAction.svelte'

export default {
	title: "Twitch Integration",
	defaults: {
		settings: {
			clientID: '',
			chatBot: {
				enabled: false,
				prefix: '[BOT]',
				suffix: '',
				name: 'Gregory',
				channels: [],
				joinMessage: 'Gregory\'s bones are ready to rumble!',
				leaveMessage: 'Sayonara, suckers!',
			}
		},
	},
	SettingsComponent: SettingsComponent,
	InstanceComponent: InstanceComponent,
	triggerEvents: {
		actions: [
			{
				title: "Chat",
				id: "chat",
				ActionComponent: ChatAction,
			}
		]
	},
	actionEvents: {
		conditions: [
			{
				title: "Redeem",
				id: "redeem",
				ConditionComponent: RedeemCondition,
				TitleComponent: RedeemTitle,
				payload: {
					"rewardID": "rewardID",
					"rewardCost": "rewardCost",
					"rewardTitle": "rewardTitle",
					"rewardImage": "rewardImage",
					"prompt": "prompt",
					"userID": "userID",
					"userName": "userName",
					"userDisplayName": "userDisplayName",
				},
			},
			{
				title: "Raid",
				id: "raid",
				ConditionComponent: RaidCondition,
				payload: {
					"userName": "",
					"userDisplayName": "",
					"viewerCount": "",
					"message": "",
				},
			},
			{
				title: "Chat",
				id: "chat",
				ConditionComponent: ChatCondition,
				payload: {
					"userMatches": "userMatches",
					"messageMatches": "messageMatches",
					"userName": "userName",
					"userColor": "userColor",
					"message": "message",
				}
			}
		],
	},
	locales: {
		"en": en,
	}
}