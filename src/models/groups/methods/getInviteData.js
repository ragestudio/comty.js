import request from "../../../request"

export default async (group_id, invite_key, { fetchData = false } = {}) => {
	if (typeof group_id !== "string") {
		throw new Error("group_id must be a string")
	}

	if (typeof invite_key !== "string") {
		throw new Error("invite_key must be a string")
	}

	const response = await request({
		method: "GET",
		url: `/groups/${group_id}/invites/${invite_key}`,
		params: {
			fetch: fetchData,
		},
	})

	return response.data
}
