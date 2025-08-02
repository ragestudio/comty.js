import request from "../../../request"

export default async () => {
	const response = await request({
		method: "GET",
		url: `/groups/my`,
	})

	return response.data
}
