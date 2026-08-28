import type { MusicModel } from ".."

export default async function (
	this: MusicModel,
	id: string,
	params?: {
		limit?: number
		offset?: number
		sort?: string
		service?: string
		type?: string
	},
) {
	if (params?.service) {
		const service = (globalThis as any).__comty_shared_state.addons.get(
			params.service,
		)
		if (!service)
			throw new Error(
				`Service ${params.service} not found. Maybe is loading yet...`,
			)
		if (typeof service.getReleaseData !== "function")
			throw new Error(
				`Service ${params.service} does not support "getReleaseData" operation`,
			)
		return await service.getReleaseData(id, params)
	}

	const { data } = await this.request({
		method: "GET",
		url: `/music/releases/${id}/data`,
		params: params,
	})

	return data
}
