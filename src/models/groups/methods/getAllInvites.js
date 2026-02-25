import request from "../../../request"

export default async (group_id) => {
	if (typeof group_id !== "string") {
		throw new Error("group_id must be a string")
	}

	const response = await request({
		method: "GET",
		url: `/groups/${group_id}/invites`,
	})

	return response.data
}
