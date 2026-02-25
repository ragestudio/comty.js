import request from "../../../request"

export default async (payload = {}) => {
	let { username, user_id, basic = false } = payload

	if (!username && !user_id) {
		const response = await request({
			method: "GET",
			url: `/users/self`,
			params: {
				basic: basic,
			},
		})

		return response.data
	}

	if (username && !user_id) {
		// resolve user_id from username
		const resolveResponse = await request({
			method: "GET",
			url: `/users/${username}/resolve-user_id`,
		})

		user_id = resolveResponse.data.user_id
	}

	const response = await request({
		method: "GET",
		url: `/users/${user_id}/data`,
		params: {
			basic: basic,
		},
	})

	return response.data
}
