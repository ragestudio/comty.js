import request from "../../../request"

export default async (payload) => {
	const response = await request({
		method: "POST",
		url: "/users/self/update",
		data: payload,
	})

	return response.data
}
