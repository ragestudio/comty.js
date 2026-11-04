import BaseEndpoint from "../../core/endpoint/BaseEndpoint"
import { Definition } from "../../core/endpoint/decorators/Definition"

export class EventsModel extends BaseEndpoint {
	/*
	 * Get featured events
	 */
	@Definition(() => ({
		method: "GET",
		url: "/featured/events",
	}))
	getFeatured!: () => Promise<Record<string, any>>

	/*
	 * Get a event data
	 */
	@Definition((id) => ({
		method: "GET",
		url: `/events/${id}/data`,
	}))
	data!: (id: string) => Promise<Record<string, any>>
}

export default new EventsModel()
