import * as v from "valibot"
import { Validate } from "../../../core/endpoint/decorators/Validate"
import type { Member, Members } from "@comty/shared/types/spaces/member"
import type { GroupBan } from "@comty/shared/types/spaces/ban"
import type { UserPresenceConnection } from "@comty/shared/types/user"

import BaseEndpoint from "../../../core/endpoint/BaseEndpoint"
import { Definition } from "../../../core/endpoint/decorators/Definition"

class GroupMembers extends BaseEndpoint {
	/**
	 * List all members of a group
	 */
	@Validate(v.pipe(v.string(), v.minLength(1, "group_id is required")))
	@Definition(
		(group_id, { limit = 50, offset = null, search = null } = {}) => ({
			method: "GET",
			url: `/groups/${group_id}/members`,
			params: { limit, offset, search },
		}),
	)
	list!: (
		group_id: string,
		opts?: {
			limit?: number
			offset?: number | string | null
			search?: string | null
		},
	) => Promise<Members>

	/**
	 * Get a member by membership_id
	 */
	@Validate(
		v.pipe(v.string(), v.minLength(1, "group_id is required")),
		v.pipe(v.string(), v.minLength(1, "membership_id is required")),
	)
	@Definition((group_id, membership_id) => ({
		method: "GET",
		url: `/groups/${group_id}/members/${membership_id}`,
	}))
	get!: (group_id: string, membership_id: string) => Promise<Member>

	/**
	 * Add a user to the group directly
	 */
	@Validate(
		v.pipe(v.string(), v.minLength(1, "group_id is required")),
		v.pipe(v.string(), v.minLength(1, "user_id is required")),
	)
	@Definition((group_id, user_id) => ({
		method: "POST",
		url: `/groups/${group_id}/members`,
		data: { user_id },
	}))
	add!: (group_id: string, user_id: string) => Promise<Member>

	/**
	 * Ban and remove a member from the group
	 */
	@Validate(
		v.pipe(v.string(), v.minLength(1, "group_id is required")),
		v.pipe(v.string(), v.minLength(1, "member_id is required")),
		v.any(),
	)
	@Definition((group_id, member_id, payload) => ({
		method: "POST",
		url: `/groups/${group_id}/members/${member_id}/ban`,
		data: payload ?? {},
	}))
	ban!: (
		group_id: string,
		member_id: string,
		payload?: { reason?: string },
	) => Promise<{ ok: boolean }>

	bans = new GroupMemberBans()

	/**
	 * Update the roles of a member
	 */
	@Validate(
		v.pipe(v.string(), v.minLength(1, "group_id is required")),
		v.pipe(v.string(), v.minLength(1, "member_id is required")),
		v.any(),
	)
	@Definition((group_id, member_id, payload) => ({
		method: "PUT",
		url: `/groups/${group_id}/members/${member_id}`,
		data: payload,
	}))
	updateRoles!: (
		group_id: string,
		member_id: string,
		payload: { add_roles?: string[]; remove_roles?: string[] },
	) => Promise<{ ok: boolean; member: Member }>

	/**
	 * Remove a member from a group by member_id
	 */
	@Validate(
		v.pipe(v.string(), v.minLength(1, "group_id is required")),
		v.pipe(v.string(), v.minLength(1, "member_id is required")),
	)
	@Definition((group_id, member_id) => ({
		method: "DELETE",
		url: `/groups/${group_id}/members/${member_id}`,
	}))
	remove!: (group_id: string, member_id: string) => Promise<Member>

	/**
	 * Get connections for a group by user_id
	 */
	@Validate(
		v.pipe(v.string(), v.minLength(1, "group_id is required")),
		v.array(v.pipe(v.string(), v.minLength(1))),
	)
	@Definition((group_id, users_id) => ({
		method: "GET",
		url: `/groups/${group_id}/members/connections`,
		params: { users_id: users_id.join(",") },
	}))
	connections!: (
		group_id: string,
		users_id: string[],
	) => Promise<UserPresenceConnection[]>
}

class GroupMemberBans extends BaseEndpoint {
	/**
	 * List the banned users of a group
	 */
	@Validate(v.pipe(v.string(), v.minLength(1, "group_id is required")))
	@Definition((group_id) => ({
		method: "GET",
		url: `/groups/${group_id}/bans`,
	}))
	list!: (group_id: string) => Promise<{ items: GroupBan[] }>

	/**
	 * Remove a ban from a user
	 */
	@Validate(
		v.pipe(v.string(), v.minLength(1, "group_id is required")),
		v.pipe(v.string(), v.minLength(1, "user_id is required")),
	)
	@Definition((group_id, user_id) => ({
		method: "DELETE",
		url: `/groups/${group_id}/bans/${user_id}`,
	}))
	remove!: (group_id: string, user_id: string) => Promise<{ success: boolean }>
}

export default new GroupMembers()
