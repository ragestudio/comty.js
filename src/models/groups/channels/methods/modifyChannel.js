import request from "../../../../request"

export default async (group_id, channel_id, payload) => {
	if (typeof group_id !== "string") {
		throw new Error("group_id is required")
	}

	if (typeof channel_id !== "string") {
		throw new Error("channel_id is required")
	}

	const response = await request({
		method: "PUT",
		url: `/groups/${group_id}/channels/${channel_id}`,
		data: payload,
	})

	return response.data
}
