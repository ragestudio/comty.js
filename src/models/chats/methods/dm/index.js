import get from "./getMessages"
import sendMessage from "./sendMessage"
import deleteMessage from "./deleteMessage"
import listRooms from "./listRooms"

export default class DM {
	static get = get
	static send = sendMessage
	static list = listRooms

	static messages = {
		delete: deleteMessage,
	}
}
