import request from "../../../../request"

export default async (to_user_id, payload) => {
	if (typeof to_user_id !== "string") {
		throw new Error("to_user_id must be a string")
	}

	if (typeof payload !== "object") {
		throw new Error("payload must be an object")
	}

	const response = await request({
		method: "POST",
		url: `/chats/dm/${to_user_id}`,
		data: payload,
	})

	return response.data
}
