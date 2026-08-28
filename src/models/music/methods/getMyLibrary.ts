import type { MusicModel } from ".."
import type { PaginatedRequest } from "../../../types"

import processAddons from "../../../helpers/processWithAddons"
import reduceStandardPaginatedMap from "../../../helpers/reduceStandardPaginatedMap"

type LibraryArgs = PaginatedRequest & {
	order?: string
	kind?: string
}

export default async function (
	this: MusicModel,
	{ limit = 100, offset = 0, order = "desc", kind }: LibraryArgs = {},
) {
	const addons = (
		globalThis as any
	).__comty_shared_state.addons.getByOperation("getMyLibrary")
	const dividedLimit = limit / (addons.length + 1)

	const { data } = await this.request({
		method: "GET",
		url: "/music/my/library",
		params: { limit: dividedLimit, offset, order, kind },
	})

	let results = await processAddons({
		operation: "getMyLibrary",
		initialData: data,
		fnArguments: [{ limit: dividedLimit, offset, order, kind }],
		normalizeAddonResult: ({ currentData, addonResult }: any) =>
			reduceStandardPaginatedMap(currentData, addonResult),
	})

	if (results.items && Array.isArray(results.items)) {
		results.items.sort((a: any, b: any) => {
			if (a.liked_at > b.liked_at) return -1
			if (a.liked_at < b.liked_at) return 1
			return 0
		})
	}

	return results
}
