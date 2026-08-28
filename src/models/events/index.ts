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
	getFeatured: () => Promise<object>

	/*
	 * Get a event data
	 */
	@Definition((id) => ({
		method: "GET",
		url: `/events/${id}/data`,
	}))
	data: (id: string) => Promise<object>
}

export default new EventsModel()
