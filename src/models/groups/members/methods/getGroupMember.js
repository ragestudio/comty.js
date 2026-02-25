import request from "../../../../request"

export default async (group_id, membership_id) => {
	if (typeof group_id !== "string") {
		throw new Error("group_id is required")
	}

	if (typeof membership_id !== "string") {
		throw new Error("membership_id is required")
	}

	const response = await request({
		method: "GET",
		url: `/groups/${group_id}/members/${membership_id}`,
	})

	return response.data
}
