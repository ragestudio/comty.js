import request from "../../../request"

export default async (group_id, channel_id, params) => {
	if (typeof group_id !== "string") {
		throw new Error("group_id must be a string")
	}

	if (typeof channel_id !== "string") {
		throw new Error("channel_id must be a string")
	}

	const response = await request({
		method: "GET",
		url: `/chats/channels/${group_id}/${channel_id}`,
		params: params,
	})

	return response.data
}
