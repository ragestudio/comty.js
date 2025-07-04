import request from "../../../request"

type RequestOptions = {
	language?: String
}

export default async (id: String, options: RequestOptions = {}) => {
	const response = await request({
		method: "GET",
		url: `/music/tracks/${id}/lyrics`,
		params: options,
	})

	// @ts-ignore
	return response.data
}
