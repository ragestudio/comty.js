import request from "../../../request"

export default async (group_id) => {
	if (typeof group_id !== "string") {
		throw new Error("group_id is required")
	}

	const response = await request({
		method: "GET",
		url: `/rtc/groups/${group_id}/state`,
	})

	return response.data
}
