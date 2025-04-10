import request from "../../../request"

export default async (type, item_id, to) => {
	if (!type) {
		throw new Error("type is required")
	}

	if (!item_id) {
		throw new Error("item_id is required")
	}

	type = type.toLowerCase()

	const response = await request({
		method: "PUT",
		url: `/music/my/library/favorite`,
		data: {
			item_id: item_id,
			kind: type,
			to: to,
		},
	})

	// @ts-ignore
	return response.data
}
