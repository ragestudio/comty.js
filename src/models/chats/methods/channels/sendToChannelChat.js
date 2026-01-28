import request from "../../../../request"

export default async (group_id, channel_id, payload) => {
	if (typeof group_id !== "string") {
		throw new Error("group_id must be a string")
	}

	if (typeof channel_id !== "string") {
		throw new Error("channel_id must be a string")
	}

	if (typeof payload !== "object") {
		throw new Error("payload must be an object")
	}

	const response = await request({
		method: "POST",
		url: `/chats/channels/${group_id}/${channel_id}`,
		data: payload,
	})

	return response.data
}
