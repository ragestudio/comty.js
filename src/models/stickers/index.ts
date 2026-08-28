import BaseModel from "../../classes/BaseModel"

import * as v from "valibot"
import { Definition } from "../../decorators/Definition"
import { Validate } from "../../decorators/Validate"

export class Stickers extends BaseModel {
	/**
	 * Get favorite stickers set
	 */
	@Definition(({ page, limit } = {}) => ({
		method: "GET",
		url: `/users/self/fav-stickers-set`,
		params: { page, limit },
	}))
	getFavStickersSet: (opts?: {
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
	get: (id: string, opts?: { fetchData?: boolean }) => Promise<any>
}

export default new Stickers()
