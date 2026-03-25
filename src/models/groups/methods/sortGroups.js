import request from "../../../request"

export default async (payload) => {
	if (!Array.isArray(payload)) {
		throw new Error("payload is required to be a array")
	}

	const response = await request({
		method: "PUT",
		url: `/groups/my/sort`,
		data: payload,
	})

	return response.data
}
