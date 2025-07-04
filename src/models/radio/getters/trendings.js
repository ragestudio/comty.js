import request from "../../../request"

export default async () => {
	const { data } = await request({
		method: "GET",
		url: "/music/radio/trendings",
	})

	return data
}
