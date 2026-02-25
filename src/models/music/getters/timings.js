import request from "../../../request"

export default async (track_id) => {
	const response = await request({
		method: "GET",
		url: `/music/tracks/${track_id}/timings`,
	})

	// @ts-ignore
	return response.data
}
