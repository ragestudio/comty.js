import request from "../../../request"

export default async (group_id, payload) => {
	if (typeof group_id !== "string") {
		throw new Error("group_id is required")
	}

	const response = await request({
		method: "POST",
		url: `/groups/${group_id}/channels/create`,
		data: payload,
	})

	return response.data
}
