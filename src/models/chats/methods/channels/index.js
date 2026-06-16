import getChannelChat from "./getChannelChat"
import sendToChannelChat from "./sendToChannelChat"
import deleteChannelMessage from "./deleteChannelMessage"
import syncChannelChat from "./sync"

export default class Channels {
	static get = getChannelChat
	static send = sendToChannelChat
	static messages = {
		delete: deleteChannelMessage,
	}
	static sync = syncChannelChat
}
