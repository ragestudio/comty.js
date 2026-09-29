import BaseModel from "../../classes/BaseModel"
import { Definition } from "../../decorators/Definition"

export class EventsModel extends BaseModel {
	/*
	 * Get featured events
	 */
	@Definition(() => ({
		method: "GET",
		url: "/featured/events",
	}))
	getFeatured: () => Promise<Record<string, any>>

	/*
	 * Get a event data
	 */
	@Definition((id) => ({
		method: "GET",
		url: `/events/${id}/data`,
	}))
	data: (id: string) => Promise<Record<string, any>>
}

export default new EventsModel()
