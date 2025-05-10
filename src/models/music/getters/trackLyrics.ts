import request from "../../../request"

type RequestOptions = {
	preferTranslation?: Boolean
}

type RequestParams = {
	translate_lang?: String
}

export default async (
	id: String,
	options: RequestOptions = {
		preferTranslation: false,
	},
) => {
	const requestParams: RequestParams = Object()

	if (options.preferTranslation) {
		requestParams.translate_lang = app.cores.settings.get("app:language")
	}

	const response = await request({
		method: "GET",
		url: `/music/tracks/${id}/lyrics`,
		params: requestParams,
	})

	// @ts-ignore
	return response.data
}
