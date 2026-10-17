import BaseEndpoint from "../../core/endpoint/BaseEndpoint"

import * as v from "valibot"
import { Definition } from "../../core/endpoint/decorators/Definition"
import { Validate } from "../../core/endpoint/decorators/Validate"

export class Stickers extends BaseEndpoint {
	/**
	 * Get favorite stickers set
	 */
	@Definition(({ page, limit } = {}) => ({
		method: "GET",
		url: `/users/self/fav-stickers-set`,
		params: { page, limit },
	}))
	getFavStickersSet!: (opts?: {
		page?: number
		limit?: number
	}) => Promise<any>

	/**
	 * Get sticker by ID
	 */
	@Validate(v.pipe(v.string(), v.minLength(1, "id is required")))
	@Definition((id, { fetchData = false } = {}) => ({
		method: "GET",
		url: `/stickers/${id}?data=${fetchData}`,
	}))
	get!: (id: string, opts?: { fetchData?: boolean }) => Promise<any>
}

export default new Stickers()
