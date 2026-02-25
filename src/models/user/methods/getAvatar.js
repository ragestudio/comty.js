import SessionModel from "../../session"
import request from "../../../request"

export default async (user_id) => {
	if (!user_id) {
		user_id = SessionModel.user_id
	}

	const { data } = await request({
		method: "GET",
		url: `/users/${user_id}/avatar`,
	})

	return data
}
