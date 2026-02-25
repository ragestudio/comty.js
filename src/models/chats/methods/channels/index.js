import getChannelChat from "./getChannelChat"
import sendToChannelChat from "./sendToChannelChat"
import deleteChannelMessage from "./deleteChannelMessage"

export default class Channels {
	static get = getChannelChat
	static send = sendToChannelChat
	static messages = {
		delete: deleteChannelMessage,
	}
}
