import BaseEndpoint from "../../core/endpoint/BaseEndpoint"
import { Definition } from "../../core/endpoint/decorators/Definition"

export class DecorationsModel extends BaseEndpoint {
	/**
	 * Get decorations by ID(s)
	 */
	@Definition((ids) => {
		let query = ids
		if (Array.isArray(ids)) {
			query = ids.join(",")
		}

		return {
			method: "GET",
			url: `/decorations/${query}`,
		}
	})
	data!: (ids: string | string[]) => Promise<Record<string, any>>
}

export default new DecorationsModel()
