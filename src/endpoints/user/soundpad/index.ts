import type { SoundpadItemPayload } from "@comty/shared/types/spaces/soundpad"

import * as v from "valibot"
import { Validate } from "../../../core/endpoint/decorators/Validate"
import { Definition } from "../../../core/endpoint/decorators/Definition"

import BaseEndpoint from "../../../core/endpoint/BaseEndpoint"

class UserSoundpad extends BaseEndpoint {
	/**
	 * Get all soundpad items of the current user
	 */
	@Definition(() => ({
		method: "GET",
		url: `/users/self/soundpad/items`,
	}))
	getItems!: () => Promise<SoundpadItemPayload[]>

	/**
	 * Get a soundpad item by ID
	 */
	@Validate(v.pipe(v.string(), v.minLength(1, "item_id is required")))
	@Definition((item_id) => ({
		method: "GET",
		url: `/users/self/soundpad/items/${item_id}`,
	}))
	getItem!: (item_id: string) => Promise<SoundpadItemPayload>

	/**
	 * Add a new soundpad item for the current user
	 */
	@Validate(
		v.object({
			icon: v.pipe(v.string(), v.minLength(1)),
			name: v.pipe(v.string(), v.minLength(1)),
			src: v.pipe(v.string(), v.minLength(1)),
		}),
	)
	@Definition((payload) => ({
		method: "POST",
		url: `/users/self/soundpad/items`,
		data: payload,
	}))
	addItem!: (
		payload: Pick<SoundpadItemPayload, "icon" | "name" | "src">,
	) => Promise<SoundpadItemPayload>

	/**
	 * Edit a soundpad item of the current user
	 */
	@Validate(
		v.object({
			_id: v.pipe(v.string(), v.minLength(1)),
			icon: v.pipe(v.string(), v.minLength(1)),
			name: v.pipe(v.string(), v.minLength(1)),
			src: v.pipe(v.string(), v.minLength(1)),
		}),
	)
	@Definition((payload) => ({
		method: "PUT",
		url: `/users/self/soundpad/items/${payload._id}`,
		data: payload,
	}))
	updateItem!: (payload: SoundpadItemPayload) => Promise<SoundpadItemPayload>

	/**
	 * Remove a soundpad item of the current user
	 */
	@Validate(v.pipe(v.string(), v.minLength(1, "item_id is required")))
	@Definition((item_id) => ({
		method: "DELETE",
		url: `/users/self/soundpad/items/${item_id}`,
	}))
	removeItem!: (item_id: string) => Promise<{ success: boolean }>
}

export default new UserSoundpad()
