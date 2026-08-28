import BaseModel from "../../../classes/BaseModel"
import { Definition } from "../../../decorators/Definition"

export class Ack extends BaseModel {
	/**
	 * Get unread messages (acks)
	 */
	@Definition(() => ({
		method: "GET",
		url: "/chats/acks",
	}))
	get: () => Promise<unknown>
}

export default new Ack()
