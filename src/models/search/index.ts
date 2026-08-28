import BaseModel from "../../classes/BaseModel"

import processAddons from "../../helpers/processWithAddons"
import standartListMerge from "../../utils/standartListMerge"

export class SearchModel extends BaseModel {
	/**
	 * Performs a search using the provided keywords and optional parameters
	 */
	async search(keywords: string, params: any = {}, returnFields?: string[]) {
		let { limit = 50, offset = 0, sort = "desc" } = params

		const { data } = await this.request({
			method: "GET",
			url: `/search`,
			params: { keywords, limit, offset, sort, fields: params.fields },
		})

		let results = await processAddons({
			operation: "search",
			initialData: data,
			fnArguments: [keywords, { limit, offset, sort }],
			normalizeAddonResult: ({ currentData, addonResult }: any) => {
				return standartListMerge(currentData, addonResult)
			},
		})

		if (Array.isArray(returnFields)) {
			return Array.from(new Set(returnFields)).reduce(
				(acc: any, field: any) => {
					acc[field] = results[field]
					return acc
				},
				{},
			)
		}

		return results
	}
}

export default new SearchModel()
