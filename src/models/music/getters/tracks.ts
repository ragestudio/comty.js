import request from "../../../request"

type Arguments = {
	user_id: String
	limit: Number
	page: Number
}

export default async ({ user_id, limit, page }: Arguments) => {
	const response = await request({
		method: "GET",
		url: "/music/tracks",
		params: {
			user_id: user_id,
			limit: limit,
			page: page,
		},
	})

	// @ts-ignore
	return response.data
}
