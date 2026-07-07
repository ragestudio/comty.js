import request from "../../../../request"

export default async (group_id: string, users_id: string[]) => {
	if (typeof group_id !== "string") {
		throw new Error("group_id is required")
	}

	const response = await request({
		method: "GET",
		url: `/groups/${group_id}/members/connections`,
		params: { users_id: users_id.join(",") },
	})

	return response.data
}
