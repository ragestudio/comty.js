import BaseModel from "../../classes/BaseModel"
import { Definition } from "../../decorators/Definition"

export class Badges extends BaseModel {
	/**
	 * Fetches badge data by badge IDs
	 */
	@Definition((ids) => {
		let query = ids;
		if (Array.isArray(ids)) query = ids.join(",")

		return {
			method: "GET",
			url: `/badges/${query}`,
		}
	})
	data: (ids: string | string[]) => Promise<unknown>
}

export default new Badges()
