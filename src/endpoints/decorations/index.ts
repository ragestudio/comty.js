import BaseEndpoint from "../../core/endpoint/BaseEndpoint"
import { Definition } from "../../core/endpoint/decorators/Definition"

export class DecorationsModel extends BaseEndpoint {
	/**
	 * List the available decorations, optionally filtered by type
	 */
	@Definition((options: { type?: string } = {}) => ({
		method: "GET",
		url: "/decorations",
		params: options,
	}))
	list!: (options?: { type?: string }) => Promise<any[]>

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

	/**
	 * Soft deletes decorations globally. Requires admin permissions.
	 */
	@Definition((ids) => {
		let query = ids
		if (Array.isArray(ids)) {
			query = ids.join(",")
		}

		return {
			method: "DELETE",
			url: `/decorations/${query}`,
		}
	})
	remove!: (ids: string | string[]) => Promise<any>
}

export default new DecorationsModel()
