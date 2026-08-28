import BaseModel from "../../classes/BaseModel"
import { Definition } from "../../decorators/Definition"

export class RadioModel extends BaseModel {
	/**
	 * Get radio list
	 */
	@Definition(({ limit = 50, offset = 0 } = {}) => ({
		method: "GET",
		url: "/music/radio/list",
		params: { limit, offset },
	}))
	getRadioList: (opts?: { limit?: number; offset?: number }) => Promise<any>

	/**
	 * Get radio trendings
	 */
	@Definition(() => ({
		method: "GET",
		url: "/music/radio/trendings",
	}))
	getTrendings: () => Promise<any>
}

export default new RadioModel()
