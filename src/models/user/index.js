import SessionModel from "../session"
import request from "../../request"

export default class User {
	/**
	 * Retrieves the data of a user.
	 *
	 * @param {Object} payload - An object containing the username and user_id.
	 * @param {string} payload.username - The username of the user.
	 * @param {string} payload.user_id - The ID of the user.
	 * @return {Promise<Object>} - A promise that resolves with the data of the user.
	 */
	static async data(payload = {}) {
		let { username, user_id, basic = false } = payload

		if (!username && !user_id) {
			user_id = SessionModel.user_id
		}

		if (username && !user_id) {
			// resolve user_id from username
			const resolveResponse = await request({
				method: "GET",
				url: `/users/${username}/resolve-user_id`,
			})

			user_id = resolveResponse.data.user_id
		}

		const response = await request({
			method: "GET",
			url: `/users/${user_id}/data`,
			params: {
				basic,
			},
		})

		return response.data
	}

	/**
	 * Updates the user data with the given payload.
	 *
	 * @param {Object} payload - The data to update the user with.
	 * @return {Promise<Object>} - A promise that resolves with the updated user data.
	 */
	static async updateData(payload) {
		const response = await request({
			method: "POST",
			url: "/users/self/update",
			data: payload,
		})

		return response.data
	}

	/**
	 * Update the public name to null in the user data.
	 *
	 * @return {Promise} A Promise that resolves with the response data after updating the public name
	 */
	static async unsetPublicName() {
		return await User.updateData({
			public_name: null,
		})
	}

	/**
	 * Retrieves the roles of a user.
	 *
	 * @param {string} user_id - The ID of the user. If not provided, the current user ID will be used.
	 * @return {Promise<Array>} An array of roles for the user.
	 */
	static async getRoles(user_id) {
		const response = await request({
			method: "GET",
			url: `/users/${user_id ?? "self"}/roles`,
		})

		return response.data
	}

	/**
	 * Retrieves the badges for a given user.
	 *
	 * @param {string} user_id - The ID of the user. If not provided, the current session user ID will be used.
	 * @return {Promise<Array>} An array of badges for the user.
	 */
	static async getBadges(user_id) {
		if (!user_id) {
			user_id = SessionModel.user_id
		}

		const { data } = await request({
			method: "GET",
			url: `/users/${user_id}/badges`,
		})

		return data
	}

	/**
	 * Retrive user config from server
	 *
	 * @param {type} key - A key of config
	 * @return {object} - Config object
	 */
	static async getConfig(key) {
		const { data } = await request({
			method: "GET",
			url: "/users/self/config",
			params: {
				key,
			},
		})

		return data
	}

	/**
	 * Update the configuration with the given update.
	 *
	 * @param {Object} update - The object containing the updated configuration data
	 * @return {Promise} A Promise that resolves with the response data after the configuration is updated
	 */
	static async updateConfig(update) {
		const { data } = await request({
			method: "PUT",
			url: "/users/self/config",
			data: update,
		})

		return data
	}
}
