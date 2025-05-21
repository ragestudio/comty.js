import request from "../../../request"
import processAddons from "../../../helpers/processWithAddons"
import standartListMerge from "../../../utils/standartListMerge"

type Params = {
	limit?: Number
	offset?: Number
	sort?: String
	service?: String
	type?: String
}

export default async (id: String, params?: Params) => {
	if (params && params.service) {
		const service = __comty_shared_state.addons.get(params.service)

		if (!service) {
			throw new Error(
				`Service ${params.service} not found. Maybe is loading yet...`,
			)
		}

		if (typeof service.getReleaseData !== "function") {
			throw new Error(
				`Service ${params.service} does not support "getReleaseData" operation`,
			)
		}

		return await service.getReleaseData(id, params)
	}

	const { data } = await request({
		method: "GET",
		url: `/music/releases/${id}/data`,
		params: params,
	})

	return data
}
