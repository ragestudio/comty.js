import request from "../../../request"
import processAddons from "../../../helpers/processWithAddons"
import standartListMerge from "../../../utils/standartListMerge"

export default async ({ limit = 100, offset = 0, order = "desc", kind }) => {
	const addons = __comty_shared_state.addons.getByOperation("getMyLibrary")

	const dividedLimit = limit / (addons.length + 1)

	const { data } = await request({
		method: "GET",
		url: "/music/my/library",
		params: {
			limit: dividedLimit,
			offset: offset,
			order: order,
			kind: kind,
		},
	})

	let results = await processAddons({
		operation: "getMyLibrary",
		initialData: data,
		fnArguments: [{ limit: dividedLimit, offset: offset, order: order }],
		normalizeAddonResult: ({ currentData, addonResult }) => {
			return standartListMerge(currentData, addonResult)
		},
	})

	// sort tracks by liked_at
	if (results.tracks) {
		results.tracks.items.sort((a, b) => {
			if (a.liked_at > b.liked_at) {
				return -1
			}
			if (a.liked_at < b.liked_at) {
				return 1
			}
			return 0
		})
	}

	return results
}
