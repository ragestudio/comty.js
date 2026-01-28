import request from "../../../request"

export default async (key) => {
	const { data } = await request({
		method: "GET",
		url: "/users/self/config",
		params: {
			key: key,
		},
	})

	return data
}
