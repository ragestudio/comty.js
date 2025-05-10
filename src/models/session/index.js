import { jwtDecode } from "jwt-decode"
import request from "../../request"
import Storage from "../../helpers/withStorage"

export default class Session {
	static storageTokenKey = "token"
	static storageRefreshTokenKey = "refreshToken"

	/**
	 * Retrieves the token from the storage engine.
	 *
	 * @return {type} description of return value
	 */
	static get token() {
		return Storage.engine.get(this.storageTokenKey)
	}

	/**
	 * Sets the token in the storage engine.
	 *
	 * @param {string} token - The token to be set.
	 * @return {Promise<void>} A promise that resolves when the token is successfully set.
	 */
	static set token(token) {
		return Storage.engine.set(this.storageTokenKey, token)
	}

	/**
	 * Retrieves the refresh token from the storage engine.
	 *
	 * @return {string} The refresh token stored in the storage engine.
	 */
	static get refreshToken() {
		return Storage.engine.get(this.storageRefreshTokenKey)
	}

	/**
	 * Sets the refresh token in the storage engine.
	 *
	 * @param {string} token - The refresh token to be set.
	 * @return {Promise<void>} A promise that resolves when the refresh token is successfully set.
	 */
	static set refreshToken(token) {
		return Storage.engine.set(this.storageRefreshTokenKey, token)
	}

	/**
	 * Retrieves the roles from the decoded token object.
	 *
	 * @return {Array<string>|undefined} The roles if they exist, otherwise undefined.
	 */
	static get roles() {
		return this.getDecodedToken()?.roles
	}

	/**
	 * Retrieves the user ID from the decoded token object.
	 *
	 * @return {string|undefined} The user ID if it exists, otherwise undefined.
	 */
	static get user_id() {
		return this.getDecodedToken()?.user_id
	}

	/**
	 * Retrieves the session UUID from the decoded token object.
	 *
	 * @return {string} The session UUID if it exists, otherwise undefined.
	 */
	static get session_uuid() {
		return this.getDecodedToken()?.session_uuid
	}

	/**
	 * Retrieves the decoded token from the session storage.
	 *
	 * @return {Object|null} The decoded token object if it exists, otherwise null.
	 */
	static getDecodedToken() {
		const token = this.token

		return token && jwtDecode(token)
	}

	/**
	 * Removes the token from the storage engine.
	 *
	 * @return {Promise<void>} A promise that resolves when the token is successfully removed.
	 */
	static removeToken() {
		return Storage.engine.remove(Session.storageTokenKey)
	}

	/**
	 * Retrieves all sessions from the server.
	 *
	 * @return {Promise<Object>} The data of all sessions.
	 */
	static async getAllSessions() {
		const response = await request({
			method: "get",
			url: "/sessions/all",
		})

		return response.data
	}

	/**
	 * Retrieves the current session from the server.
	 *
	 * @return {Promise<Object>} The data of the current session.
	 */
	static async getCurrentSession() {
		const response = await request({
			method: "get",
			url: "/sessions/current",
		})

		return response.data
	}

	/**
	 * Destroys the current session by deleting it from the server.
	 *
	 * @return {Promise<Object>} The response data from the server after deleting the session.
	 */
	static async destroyCurrentSession() {
		const token = await Session.token
		const session = await Session.getDecodedToken()

		if (!session || !token) {
			return false
		}

		const response = await request({
			method: "delete",
			url: "/sessions/current",
		}).catch((error) => {
			console.error(error)

			return false
		})

		Session.removeToken()

		__comty_shared_state.eventBus.emit("session.destroyed")

		return response.data
	}

	static async destroyAll() {
		const response = await request({
			method: "delete",
			url: "/sessions/all",
		})

		return response.data
	}

	/**
	 * Retrieves the validity of the current token.
	 *
	 * @return {boolean} The validity status of the current token.
	 */
	static async isCurrentTokenValid() {
		const health = await Session.getTokenValidation()

		return health.valid
	}
}
