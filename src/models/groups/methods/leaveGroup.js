import request from "../../../request"

export default async (group_id) => {
	if (typeof group_id !== "string") {
		throw new Error("group_id is required to be a string")
	}

	const response = await request({
		method: "POST",
		url: `/groups/${group_id}/leave`,
	})

	return response.data
}
