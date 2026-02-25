import request from "../../request"

export default class Badges {
	static async data(ids) {
		if (Array.isArray(ids)) {
			ids = ids.join(",")
		}

		const response = await request({
			method: "GET",
			url: `/badges/${ids}`,
		})

		return response.data
	}
}
