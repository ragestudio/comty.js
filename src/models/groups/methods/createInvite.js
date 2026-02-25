import request from "../../../request"

export default async (group_id, payload) => {
	if (typeof group_id !== "string") {
		throw new Error("group_id must be a string")
	}

	const response = await request({
		method: "POST",
		url: `/groups/${group_id}/invites/create`,
		data: payload,
	})

	return response.data
}
