import request from "../../../request"

export default async ({ limit = 50, offset = 0 } = {}) => {
	const { data } = await request({
		method: "GET",
		url: "/music/radio/list",
		params: { limit, offset },
	})

	return data
}
