import request from "../../../request"

export default async (update) => {
	const { data } = await request({
		method: "PUT",
		url: "/users/self/config",
		data: update,
	})

	return data
}
