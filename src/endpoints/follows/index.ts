import * as v from "valibot"

import BaseEndpoint from "../../core/endpoint/BaseEndpoint"
import { Definition } from "../../core/endpoint/decorators/Definition"
import { Validate } from "../../core/endpoint/decorators/Validate"

import session from "../../core/session"

export class FollowsModel extends BaseEndpoint {
	/**
	 * Checks if the current user is following the specified user.
	 */
	@Validate(v.pipe(v.string(), v.minLength(1, "user_id is required")))
	@Definition((user_id: string) => ({
		method: "GET",
		url: `/users/${user_id}/following`,
	}))
	imFollowing!: (user_id: string) => Promise<Record<string, any>>

	/**
	 * Retrieves the list of followers for a given user.
	 */
	@Definition((user_id?: string, params?: object) => {
		if (!user_id) {
			user_id = session.user_id
		}

		return {
			method: "GET",
			url: `/users/${user_id}/followers`,
			params: params,
		}
	})
	getFollowers!: (
		user_id?: string,
		params?: object,
	) => Promise<Record<string, any>>

	/**
	 * Toggles the follow status for a user.
	 */
	@Validate(v.pipe(v.string(), v.minLength(1, "user_id is required")))
	@Definition(({ user_id }: { user_id: string }) => ({
		method: "POST",
		url: `/users/${user_id}/follow`,
	}))
	toggleFollow!: ({
		user_id,
	}: {
		user_id: string
	}) => Promise<Record<string, any>>
}

export default new FollowsModel()
