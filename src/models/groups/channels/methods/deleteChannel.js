import request from "../../../../request"

export default async (group_id, channel_id) => {
	if (typeof group_id !== "string") {
		throw new Error("group_id is required")
	}

	if (typeof channel_id !== "string") {
		throw new Error("channel_id is required")
	}

	const response = await request({
		method: "DELETE",
		url: `/groups/${group_id}/channels/${channel_id}`,
	})

	return response.data
}
