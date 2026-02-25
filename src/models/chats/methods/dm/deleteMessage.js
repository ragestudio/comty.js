import request from "../../../../request"

export default async (to_user_id, message_id) => {
	if (typeof to_user_id !== "string") {
		throw new Error("to_user_id must be a string")
	}

	if (typeof message_id !== "string") {
		throw new Error("message_id must be a string")
	}

	const response = await request({
		method: "DELETE",
		url: `/chats/dm/${to_user_id}/${message_id}`,
	})

	return response.data
}
