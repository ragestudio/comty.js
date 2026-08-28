import BaseModel from "../../classes/BaseModel"
import { Definition } from "../../decorators/Definition"

export class DecorationsModel extends BaseModel {
	/**
	 * Get decorations by ID(s)
	 */
	@Definition((ids) => {
		let query = ids;
		if (Array.isArray(ids)) {
			query = ids.join(",")
		}

		return {
			method: "GET",
			url: `/decorations/${query}`,
		}
	})
	data: (ids: string | string[]) => Promise<object>
}

export default new DecorationsModel()
