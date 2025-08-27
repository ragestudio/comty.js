import request from "../../../request"

export default async (group_id, channel_id, message_id) => {
	if (typeof group_id !== "string") {
		throw new Error("group_id must be a string")
	}

	if (typeof channel_id !== "string") {
		throw new Error("channel_id must be a string")
	}

	if (typeof message_id !== "string") {
		throw new Error("message_id must be a string")
	}

	const response = await request({
		method: "DELETE",
		url: `/chats/channels/${group_id}/${channel_id}/${message_id}`,
	})

	return response.data
}
