import request from "../../request"

export default class Decorations {
	static async data(ids) {
		if (Array.isArray(ids)) {
			ids = ids.join(",")
		}

		const response = await request({
			method: "GET",
			url: `/decorations/${ids}`,
		})

		return response.data
	}
}
