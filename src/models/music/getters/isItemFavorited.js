import request from "../../../request"

export default async (type, item_id) => {
	if (!type) {
		throw new Error("type is required")
	}

	if (!item_id) {
		throw new Error("item_id is required")
	}

	type = type.toLowerCase()

	const response = await request({
		method: "GET",
		url: `/music/my/library/favorite`,
		params: {
			kind: type,
			item_id: item_id,
		},
	})

	// @ts-ignore
	return response.data
}
