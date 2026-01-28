import request from "../../../request"

export default async (user_id) => {
	const response = await request({
		method: "GET",
		url: `/users/${user_id ?? "self"}/roles`,
	})

	return response.data
}
