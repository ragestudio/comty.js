import request from "../../../../request"

export default async (params) => {
	const response = await request({
		method: "GET",
		url: `/chats/dm`,
		params: params,
	})

	return response.data
}
