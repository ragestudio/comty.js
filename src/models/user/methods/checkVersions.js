import request from "../../../request"

export default async function (user_ids) {
	if (!Array.isArray(user_ids) || user_ids.length === 0) {
		return {}
	}

	const response = await request({
		method: "POST",
		url: "/users/check-versions",
		data: { user_ids },
	})

	return response.data
}
