import type { SoundpadItemPayload } from "@comty/shared/types/spaces/soundpad"

import * as v from "valibot"
import { Validate } from "../../../core/endpoint/decorators/Validate"
import { Definition } from "../../../core/endpoint/decorators/Definition"

import BaseEndpoint from "../../../core/endpoint/BaseEndpoint"

class GroupSoundpad extends BaseEndpoint {
	/**
	 * Get all soundpad items for a group
	 */
	@Validate(v.pipe(v.string(), v.minLength(1, "group_id is required")))
	@Definition((group_id) => ({
		method: "GET",
		url: `/groups/${group_id}/soundpad/items`,
	}))
	getItems!: (group_id: string) => Promise<SoundpadItemPayload[]>

	/**
	 * Get a soundpad item by ID
	 */
	@Validate(
		v.pipe(v.string(), v.minLength(1, "group_id is required")),
		v.pipe(v.string(), v.minLength(1, "item_id is required")),
	)
	@Definition((group_id, item_id) => ({
		method: "GET",
		url: `/groups/${group_id}/soundpad/items/${item_id}`,
	}))
	getItem!: (
		group_id: string,
		item_id: string,
	) => Promise<SoundpadItemPayload>

	/**
	 * Add a new soundpad item to a group
	 */
	@Validate(
		v.pipe(v.string(), v.minLength(1, "group_id is required")),
		v.object({
			icon: v.pipe(v.string(), v.minLength(1)),
			name: v.pipe(v.string(), v.minLength(1)),
			src: v.pipe(v.string(), v.minLength(1)),
		}),
	)
	@Definition((group_id, payload) => ({
		method: "POST",
		url: `/groups/${group_id}/soundpad/items`,
		data: payload,
	}))
	addItem!: (
		group_id: string,
		payload: Pick<SoundpadItemPayload, "icon" | "name" | "src">,
	) => Promise<SoundpadItemPayload>

	/**
	 * Edit a soundpad item to a group
	 */
	@Validate(
		v.pipe(v.string(), v.minLength(1, "group_id is required")),
		v.object({
			_id: v.pipe(v.string(), v.minLength(1)),
			icon: v.pipe(v.string(), v.minLength(1)),
			name: v.pipe(v.string(), v.minLength(1)),
			src: v.pipe(v.string(), v.minLength(1)),
		}),
	)
	@Definition((group_id, payload) => ({
		method: "PUT",
		url: `/groups/${group_id}/soundpad/items/${payload._id}`,
		data: payload,
	}))
	updateItem!: (
		group_id: string,
		payload: SoundpadItemPayload,
	) => Promise<SoundpadItemPayload>

	/**
	 * Remove a soundpad item from a group
	 */
	@Validate(
		v.pipe(v.string(), v.minLength(1, "group_id is required")),
		v.pipe(v.string(), v.minLength(1, "item_id is required")),
	)
	@Definition((group_id, item_id) => ({
		method: "DELETE",
		url: `/groups/${group_id}/soundpad/items/${item_id}`,
	}))
	removeItem!: (
		group_id: string,
		item_id: string,
	) => Promise<{ success: boolean }>
}

export default new GroupSoundpad()
