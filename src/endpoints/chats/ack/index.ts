import BaseEndpoint from "../../../core/endpoint/BaseEndpoint"
import { Definition } from "../../../core/endpoint/decorators/Definition"

export class Ack extends BaseEndpoint {
	/**
	 * Get unread messages (acks)
	 */
	@Definition(() => ({
		method: "GET",
		url: "/chats/acks",
	}))
	get!: () => Promise<unknown>
}

export default new Ack()
