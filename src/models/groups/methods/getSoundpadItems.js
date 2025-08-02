import request from "../../../request"

export default async (group_id) => {
	const response = await request({
		method: "GET",
		url: `/groups/${group_id}/soundpad/items`,
	})

	return response.data
}
