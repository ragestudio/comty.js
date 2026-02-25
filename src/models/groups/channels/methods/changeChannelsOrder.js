import request from "../../../../request"

export default async (group_id, order) => {
	if (typeof group_id !== "string") {
		throw new Error("group_id is required")
	}

	if (!Array.isArray(order)) {
		throw new Error("order is required")
	}

	const response = await request({
		method: "POST",
		url: `/groups/${group_id}/channels/order`,
		data: { order: order },
	})

	return response.data
}
