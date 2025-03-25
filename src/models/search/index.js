import request from "../../request"
import processAddons from "../../helpers/processWithAddons"
import standartListMerge from "../../utils/standartListMerge"

export default class Search {
	/**
	 * Performs a search using the provided keywords and optional parameters.
	 *
	 * @description
	 * This method is used to perform a search using the provided keywords and optional parameters.
	 * Additionally, supports for external addons to extend the search functionality.
	 *
	 * @param {string} keywords - The keywords to search for.
	 * @param {Object} [params={}] - Optional parameters for the search.
	 * @param {Array} [returnFields=[]] - An array of fields to return in the results. If empty, all fields will be returned.
	 * @return {Promise<Object>} A promise that resolves with the search results.
	 */
	static async search(keywords, params = {}, returnFields) {
		let { limit = 50, offset = 0, sort = "desc" } = params

		const { data } = await request({
			method: "GET",
			url: `/search`,
			params: {
				keywords: keywords,
				limit: limit,
				offset: offset,
				sort: sort,
				fields: params.fields,
			},
		})

		let results = await processAddons({
			operation: "search",
			initialData: data,
			fnArguments: [
				keywords,
				{
					limit: limit,
					offset: offset,
					sort: sort,
				},
			],
			normalizeAddonResult: ({ currentData, addonResult }) => {
				return standartListMerge(currentData, addonResult)
			},
		})

		if (Array.isArray(returnFields)) {
			return Array.from(new Set(returnFields)).reduce((acc, field) => {
				acc[field] = results[field]
				return acc
			}, {})
		}

		return results
	}
}
