import * as v from "valibot"

import BaseModel from "../../classes/BaseModel"
import { Definition } from "../../decorators/Definition"
import { Validate } from "../../decorators/Validate"

import SessionModel from "../session"

export class FollowsModel extends BaseModel {
	/**
	 * Checks if the current user is following the specified user.
	 */
	@Validate(v.pipe(v.string(), v.minLength(1, "user_id is required")))
	@Definition((user_id: string) => ({
		method: "GET",
		url: `/users/${user_id}/following`,
	}))
	imFollowing: (user_id: string) => Promise<Object>

	/**
	 * Retrieves the list of followers for a given user.
	 */
	@Definition((user_id?: string, params?: object) => {
		if (!user_id) {
			user_id = SessionModel.user_id
		}

		return {
			method: "GET",
			url: `/users/${user_id}/followers`,
			params: params,
		}
	})
	getFollowers: (user_id?: string, params?: object) => Promise<Object>

	/**
	 * Toggles the follow status for a user.
	 */
	@Validate(v.pipe(v.string(), v.minLength(1, "user_id is required")))
	@Definition(({ user_id }: { user_id: string }) => ({
		method: "POST",
		url: `/users/${user_id}/follow`,
	}))
	toggleFollow: ({ user_id }: { user_id: string }) => Promise<Object>
}

export default new FollowsModel()
