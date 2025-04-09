import request from "../../request"

export default class EventsModel {
	static async getFeatured() {
		const { data } = await request({
			method: "GET",
			url: "/featured/events",
		})

		return data
	}

	static async data(id) {
		const { data } = await request({
			method: "GET",
			url: `/events/${id}/data`,
		})

		return data
	}
}
