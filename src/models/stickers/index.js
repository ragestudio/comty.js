import request from "../../request"

export default class Stickers {
	static async getFavStickersSet({ page, limit } = {}) {
		const response = await request({
			method: "GET",
			url: `/users/self/fav-stickers-set`,
			params: {
				page,
				limit,
			},
		})

		return response.data
	}

	static async get(id, { fetchData = false }) {
		if (!id) {
			throw new Error("id is required")
		}

		const response = await request({
			method: "GET",
			url: `/stickers/${id}?data=${fetchData}`,
		})

		return response.data
	}
}
