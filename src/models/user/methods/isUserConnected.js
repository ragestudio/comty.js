import SessionModel from "../../session"
import request from "../../../request"

export default async (user_id) => {
	if (!user_id) {
		user_id = SessionModel.user_id
	}

	if (Array.isArray(user_id)) {
		user_id = user_id.join(",")
	}

	const { data } = await request({
		method: "GET",
		url: `/users/${user_id}/is-connected`,
	})

	return data
}
