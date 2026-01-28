import request from "../../../request"

export default async ({ group_id, invite_key }) => {
	if (!group_id || !invite_key) {
		throw new Error("group_id and invite_key are required")
	}

	const response = await request({
		method: "POST",
		url: `groups/${group_id}/join`,
		data: {
			invite_key: invite_key,
		},
	})

	return response.data
}
