import request from "../../../../request"

export default async (group_id, member_id) => {
	if (typeof group_id !== "string") {
		throw new Error("group_id is required")
	}

	if (typeof member_id !== "string") {
		throw new Error("member_id is required")
	}

	const response = await request({
		method: "DELETE",
		url: `/groups/${group_id}/members/${member_id}`,
	})

	return response.data
}
