import BaseModel from "../../../classes/BaseModel"
import { Definition } from "../../../decorators/Definition"

export type SyncParams = {
	last_synced_at?: number | string
	last_message_id?: number | string
}

export class Channels extends BaseModel {
	/**
	 * Get sync a channel chat by group and channel ID
	 */
	@Definition((group_id, channel_id, params) => ({
		method: "GET",
		url: `/chats/channels/${group_id}/${channel_id}/sync`,
		params: params,
	}))
	sync: (group_id: string, channel_id: string, params?: SyncParams) => Promise<object>

	messages = new ChannelsMessagesMethods()
}

class ChannelsMessagesMethods extends BaseModel {
	/**
	 * Get messages from a channel chat by group and channel ID.
	 */
	@Definition((group_id, channel_id, params) => ({
		method: "GET",
		url: `/chats/channels/${group_id}/${channel_id}`,
		params: params,
	}))
	get: (group_id: string, channel_id: string, params?: any) => Promise<object>

	/**
	 * Send a message to a channel chat by group and channel ID.
	 */
	@Definition((group_id, channel_id, payload) => ({
		method: "POST",
		url: `/chats/channels/${group_id}/${channel_id}`,
		data: payload,
	}))
	send: (group_id: string, channel_id: string, payload?: any) => Promise<object>

	/**
	 * Delete a message from a channel chat by group and channel ID
	 */
	@Definition((group_id, channel_id, message_id) => ({
		method: "DELETE",
		url: `/chats/channels/${group_id}/${channel_id}/${message_id}`,
	}))
	delete: (group_id: string, channel_id: string, message_id: string) => Promise<object>
}

export default new Channels()
