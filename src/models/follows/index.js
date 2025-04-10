import SessionModel from "../../models/session"
import request from "../../request"

export default class FollowsModel {
	/**
	 * Checks if the current user is following the specified user.
	 *
	 * @param {string} user_id - The ID of the user to check if the current user is following.
	 * @return {Promise<Object>} A promise that resolves with the response data indicating if the current user is following the specified user.
	 * @throws {Error} If the user_id parameter is not provided.
	 */
	static async imFollowing(user_id) {
		if (!user_id) {
			throw new Error("user_id is required")
		}

		const response = await request({
			method: "GET",
			url: `/users/${user_id}/following`,
		})

		return response.data
	}

	/**
	 * Retrieves the list of followers for a given user.
	 *
	 * @param {string} user_id - The ID of the user. If not provided, the current user ID will be used.
	 * @param {object} params - Additional parameters to pass to the API.
	 * @return {Promise<Object>} A promise that resolves with the list of followers and their data.
	 */
	static async getFollowers(user_id, params) {
		if (!user_id) {
			user_id = SessionModel.user_id
		}

		const response = await request({
			method: "GET",
			url: `/users/${user_id}/followers`,
			params: params,
		})

		return response.data
	}

	/**
	 * Toggles the follow status for a user.
	 *
	 * @param {Object} user_id - The ID of the user to toggle follow status.
	 * @return {Promise} The response data after toggling follow status.
	 */
	static async toggleFollow({ user_id }) {
		if (!user_id) {
			throw new Error("user_id is required")
		}

		const response = await request({
			method: "POST",
			url: `/users/${user_id}/follow`,
		})

		return response.data
	}
}
