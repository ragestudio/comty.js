import type {
	Group,
	GroupViewer,
	MetaGroup,
} from "@comty/shared/types/spaces/group"
import type { PaginatedResponse } from "../../types"

import * as v from "valibot"
import { Validate } from "../../core/endpoint/decorators/Validate"
import { Definition } from "../../core/endpoint/decorators/Definition"

import BaseEndpoint from "../../core/endpoint/BaseEndpoint"

import Members from "./members"
import Channels from "./channels"
import Invites from "./invites"
import Soundpad from "./soundpad"
import Roles from "./roles"
import Rtc from "./rtc"

class GroupsModel extends BaseEndpoint {
	/**
	 * Get all groups the user is a member of
	 */
	@Definition(() => ({ method: "GET", url: `/groups/my` }))
	getMy!: () => Promise<PaginatedResponse<Group>>

	/**
	 * Create a new group
	 */
	@Validate(v.any())
	@Definition((payload) => ({
		method: "POST",
		url: "/groups/create",
		data: payload,
	}))
	create!: (payload: Partial<Group>) => Promise<Group>

	/**
	 * Get a group by ID
	 */
	@Validate(v.pipe(v.string(), v.minLength(1, "group_id is required")))
	@Definition((group_id) => ({ method: "GET", url: `/groups/${group_id}` }))
	get!: (group_id: string) => Promise<Group>

	/**
	 * Modify a group
	 */
	@Validate(v.pipe(v.string(), v.minLength(1, "group_id is required")), v.any())
	@Definition((group_id, payload) => ({
		method: "PUT",
		url: `/groups/${group_id}`,
		data: payload,
	}))
	modify!: (group_id: string, payload: Partial<Group>) => Promise<Group>

	/**
	 * Delete a group
	 */
	@Validate(v.pipe(v.string(), v.minLength(1, "group_id is required")))
	@Definition((group_id) => ({
		method: "DELETE",
		url: `/groups/${group_id}`,
	}))
	delete!: (group_id: string) => Promise<{ success: boolean }>

	/**
	 * Sort groups
	 */
	@Validate(v.array(v.string()))
	@Definition((payload) => ({
		method: "PUT",
		url: `/groups/my/sort`,
		data: payload,
	}))
	sort!: (payload: string[]) => Promise<{ success: boolean }>

	/**
	 * Leave a group
	 */
	@Validate(v.pipe(v.string(), v.minLength(1, "group_id is required")))
	@Definition((group_id) => ({
		method: "POST",
		url: `/groups/${group_id}/leave`,
	}))
	leave!: (group_id: string) => Promise<{ success: boolean }>

	/**
	 * Get group meta
	 */
	@Validate(v.pipe(v.string(), v.minLength(1, "group_id is required")))
	@Definition((group_id) => ({
		method: "GET",
		url: `/groups/${group_id}/meta`,
	}))
	meta!: (group_id: string) => Promise<MetaGroup>

	/**
	 * Transfer the group ownership to another member
	 */
	@Validate(
		v.pipe(v.string(), v.minLength(1, "group_id is required")),
		v.pipe(v.string(), v.minLength(1, "user_id is required")),
	)
	@Definition((group_id, user_id) => ({
		method: "POST",
		url: `/groups/${group_id}/transfer-ownership`,
		data: { user_id },
	}))
	transferOwnership!: (group_id: string, user_id: string) => Promise<Group>

	/**
	 * Get the viewer permissions and roles for a group
	 */
	@Validate(v.pipe(v.string(), v.minLength(1, "group_id is required")))
	@Definition((group_id) => ({
		method: "GET",
		url: `/groups/${group_id}/permissions`,
	}))
	permissions!: (group_id: string) => Promise<GroupViewer>

	members = Members
	channels = Channels
	invites = Invites
	soundpad = Soundpad
	roles = Roles
	rtc = Rtc
}

export default new GroupsModel()
