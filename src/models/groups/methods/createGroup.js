import request from "../../../request"

export default async (payload) => {
	const response = await request({
		method: "POST",
		url: "/groups/create",
		data: payload,
	})

	return response.data
}
