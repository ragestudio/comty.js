import type { GroupRole } from "@comty/shared/types/spaces/role"

import * as v from "valibot"
import { Validate } from "../../../core/endpoint/decorators/Validate"
import { Definition } from "../../../core/endpoint/decorators/Definition"

import BaseEndpoint from "../../../core/endpoint/BaseEndpoint"

export type CreateRolePayload = {
	label: string
	role_key?: string
	color?: string
	permissions?: Record<string, boolean>
}

export type UpdateRolePayload = {
	label?: string
	color?: string | null
	position?: number
	permissions?: Record<string, boolean>
}

class GroupRoles extends BaseEndpoint {
	/**
	 * List every role of a group
	 */
	@Validate(v.pipe(v.string(), v.minLength(1, "group_id is required")))
	@Definition((group_id) => ({
		method: "GET",
		url: `/groups/${group_id}/roles`,
	}))
	list!: (group_id: string) => Promise<{ items: GroupRole[] }>

	/**
	 * Create a new role
	 */
	@Validate(v.pipe(v.string(), v.minLength(1, "group_id is required")), v.any())
	@Definition((group_id, payload) => ({
		method: "POST",
		url: `/groups/${group_id}/roles`,
		data: payload,
	}))
	create!: (group_id: string, payload: CreateRolePayload) => Promise<GroupRole>

	/**
	 * Update a role
	 */
	@Validate(
		v.pipe(v.string(), v.minLength(1, "group_id is required")),
		v.pipe(v.string(), v.minLength(1, "role_key is required")),
		v.any(),
	)
	@Definition((group_id, role_key, payload) => ({
		method: "PUT",
		url: `/groups/${group_id}/roles/${role_key}`,
		data: payload,
	}))
	update!: (
		group_id: string,
		role_key: string,
		payload: UpdateRolePayload,
	) => Promise<GroupRole>

	/**
	 * Delete a role
	 */
	@Validate(
		v.pipe(v.string(), v.minLength(1, "group_id is required")),
		v.pipe(v.string(), v.minLength(1, "role_key is required")),
	)
	@Definition((group_id, role_key) => ({
		method: "DELETE",
		url: `/groups/${group_id}/roles/${role_key}`,
	}))
	delete!: (group_id: string, role_key: string) => Promise<{ success: boolean }>

	/**
	 * Reorder roles, the first item is the most powerful role
	 */
	@Validate(
		v.pipe(v.string(), v.minLength(1, "group_id is required")),
		v.array(v.pipe(v.string(), v.minLength(1))),
	)
	@Definition((group_id, order) => ({
		method: "POST",
		url: `/groups/${group_id}/roles/order`,
		data: { order },
	}))
	order!: (group_id: string, order: string[]) => Promise<{ items: GroupRole[] }>
}

export default new GroupRoles()
