import request from "../../../request"

export default async (group_id, { limit = 50, page = 0 } = {}) => {
	if (typeof group_id !== "string") {
		throw new Error("group_id is required")
	}

	const response = await request({
		method: "GET",
		url: `/groups/${group_id}/members`,
		params: {
			limit: limit,
			page: page,
		},
	})

	return response.data
}
