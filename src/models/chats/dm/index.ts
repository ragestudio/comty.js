import BaseModel from "../../../classes/BaseModel"
import { Definition } from "../../../decorators/Definition"

export class DMModel extends BaseModel {
	/**
	 * List all DM rooms
	 */
	@Definition((params) => ({
		method: "GET",
		url: `/chats/dm/`,
		params: params,
	}))
	list: (params?: object) => Promise<object>

	messages = new DMMessagesMethods()
}

class DMMessagesMethods extends BaseModel {
	/**
	 * Get messages from a DM chat
	 */
	@Definition((to_user_id, params) => ({
		method: "GET",
		url: `/chats/dm/${to_user_id}`,
		params: params,
	}))
	get: (to_user_id: string, params?: object) => Promise<object>

	/**
	 * Send a message to a DM chat
	 */
	@Definition((to_user_id, payload) => ({
		method: "POST",
		url: `/chats/dm/${to_user_id}`,
		data: payload,
	}))
	send: (to_user_id: string, payload: object) => Promise<object>

	/**
	 * Delete a message from a DM chat
	 */
	@Definition((to_user_id, message_id) => ({
		method: "DELETE",
		url: `/chats/dm/${to_user_id}/${message_id}`,
	}))
	delete: (to_user_id: string, message_id: string) => Promise<object>
}

export default new DMModel()
