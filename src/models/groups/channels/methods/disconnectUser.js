import request from "../../../../request"

export default async (group_id, channel_id, user_id) => {
	if (typeof group_id !== "string") {
		throw new Error("group_id is required")
	}

	if (typeof channel_id !== "string") {
		throw new Error("channel_id is required")
	}

	if (typeof user_id !== "string") {
		throw new Error("user_id is required")
	}

	const response = await request({
		method: "POST",
		url: `/rtc/groups/${group_id}/${channel_id}/${user_id}/disconnect`,
	})

	return response.data
}
