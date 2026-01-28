import request from "../../../../request"

export default async (to_user_id, params) => {
	if (typeof to_user_id !== "string") {
		throw new Error("to_user_id must be a string")
	}

	const response = await request({
		method: "GET",
		url: `/chats/dm/${to_user_id}`,
		params: params,
	})

	return response.data
}
