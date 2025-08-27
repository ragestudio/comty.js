import getChannelChat from "./methods/getChannelChat"
import sendToChannelChat from "./methods/sendToChannelChat"
import deleteChannelMessage from "./methods/deleteChannelMessage"

export default class ChatsService {
	static channels = {
		get: getChannelChat,
		send: sendToChannelChat,
		messages: {
			delete: deleteChannelMessage,
		},
	}
}
