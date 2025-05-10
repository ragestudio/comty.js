import request from "../../request"
import SessionModel from "../session"

export default class AuthModel {
	/**
	 * Async function to handle the login process.
	 *
	 * @param {Object} payload - The payload containing username, password, and MFA code.
	 * @param {Function} callback - Optional callback function to handle further actions.
	 * @return {Object|boolean} The response data if login successful, false if MFA is required.
	 */
	static async login(payload, callback) {
		const response = await request({
			method: "post",
			url: "/auth",
			data: payload,
		})

		if (response.data.mfa_required) {
			__comty_shared_state.eventBus.emit("auth:mfa_required")

			if (typeof callback === "function") {
				await callback({
					mfa_required: {
						method: response.data.method,
						sended_to: response.data.sended_to,
					},
				})
			}

			return false
		}

		SessionModel.token = response.data.token
		SessionModel.refreshToken = response.data.refreshToken

		if (typeof callback === "function") {
			await callback(response.data)
		}

		__comty_shared_state.eventBus.emit("auth:login_success")

		return response.data
	}

	/**
	 * Asynchronously logs out the user by destroying the current session and emitting an event for successful logout.
	 *
	 * @return {Promise<void>} A Promise that resolves after the logout process is completed.
	 */
	static async logout() {
		await SessionModel.destroyCurrentSession()

		await SessionModel.removeToken()

		__comty_shared_state.eventBus.emit("auth:logout_success")
	}

	/**
	 * Registers a new user with the provided payload.
	 *
	 * @param {Object} payload - The payload containing the user's information.
	 * @param {string} payload.username - The username of the user.
	 * @param {string} payload.password - The password of the user.
	 * @param {string} payload.email - The email of the user.
	 * @param {boolean} payload.tos - The acceptance of the terms of service.
	 * @return {Promise<Object>} A Promise that resolves with the response data if the registration is successful, or false if there was an error.
	 * @throws {Error} Throws an error if the registration fails.
	 */
	static async register(payload) {
		const { username, password, email, tos } = payload

		const response = await request({
			method: "post",
			url: "/register",
			data: {
				username,
				password,
				email,
				accept_tos: tos,
			},
		}).catch((error) => {
			console.error(error)

			return false
		})

		if (!response) {
			throw new Error("Unable to register user")
		}

		return response
	}

	/**
	 * Verifies the given token and returns the user data associated with it.
	 *
	 * @param {string} [token] - The token to verify. If not provided, the stored token is used.
	 * @return {Promise<Object>} A Promise that resolves with the user data if the token is valid, or false if the token is invalid.
	 * @throws {Error} Throws an error if there was an issue with the request.
	 */
	static async authToken(token) {
		if (!token) {
			token = await SessionModel.token
		}

		const response = await request({
			method: "POST",
			url: "/auth/token",
			data: {
				token: token,
			},
		})

		return response.data
	}

	/**
	 * Validates the existence of a username by making a GET request to the `/auth/{username}/exists` endpoint.
	 *
	 * @param {string} username - The username to validate.
	 * @return {Promise<boolean|Object>} A Promise that resolves with the response data if the validation is successful,
	 * or false if there was an error. Throws an error if the validation fails.
	 */
	static async usernameValidation(username) {
		const response = await request({
			method: "get",
			url: `/auth/${username}/exists`,
		}).catch((error) => {
			console.error(error)

			return false
		})

		if (!response) {
			throw new Error("Unable to validate user")
		}

		return response.data
	}

	/**
	 * Retrieves the availability of a username and email by making a GET request to the `/availability` endpoint.
	 *
	 * @param {Object} payload - The payload containing the username and email.
	 * @param {string} payload.username - The username to check availability for.
	 * @param {string} payload.email - The email to check availability for.
	 * @return {Promise<Object|boolean>} A Promise that resolves with the availability data if successful, or false if an error occurred.
	 */
	static async availability(payload) {
		const { username, email } = payload

		const response = await request({
			method: "get",
			url: `/availability`,
			params: {
				username,
				email,
			},
		}).catch((error) => {
			console.error(error)

			return false
		})

		return response.data
	}

	/**
	 * A function to change the user's password.
	 *
	 * @param {Object} payload - An object containing the currentPassword, newPassword, and code.
	 * @param {string} payload.currentPassword - The current password of the user.
	 * @param {string} payload.newPassword - The new password to set for the user.
	 * @param {string} [payload.code] - The activation code sent to the user's email, optional if the old password is provided.
	 * @return {Promise<Object>} The data response after changing the password.
	 */
	static async changePassword(payload) {
		const { currentPassword, newPassword, code, verificationToken } =
			payload

		const { data } = await request({
			method: "put",
			url: "/auth/password",
			data: {
				code: code,
				verificationToken: verificationToken,
				old_password: currentPassword,
				new_password: newPassword,
			},
		})

		return data
	}

	/**
	 * Activates a user account using the provided activation code.
	 *
	 * @param {string} user_id - The ID of the user to activate.
	 * @param {string} code - The activation code sent to the user's email.
	 * @return {Promise<Object>} A promise that resolves with the response data after activation.
	 * @throws {Error} Throws an error if the activation process fails.
	 */
	static async activateAccount(user_id, code) {
		const { data } = await request({
			method: "post",
			url: "/auth/activate",
			data: {
				code: code,
				user_id: user_id,
			},
		})

		return data
	}

	/**
	 * Resends the activation code to the user.
	 *
	 * @return {Promise<Object>} A promise that resolves with the response data after sending the activation code.
	 * @throws {Error} Throws an error if the resend activation code process fails.
	 * @param user_id
	 */
	static async resendActivationCode(user_id) {
		const { data } = await request({
			method: "post",
			url: "/auth/resend-activation-code",
			data: {
				user_id: user_id,
			},
		})

		return data
	}

	static async disableAccount({ confirm = false } = {}) {
		if (!confirm) {
			console.error(
				"In order to disable your account, you must confirm the action.",
			)
			return null
		}

		const { data } = await request({
			method: "post",
			url: "/auth/disable-account",
		})

		__comty_shared_state.eventBus.emit("auth:disabled_account")

		return data
	}

	static async recoverPassword(usernameOrEmail) {
		const { data } = await request({
			method: "post",
			url: "/auth/recover-password",
			data: {
				account: usernameOrEmail,
			},
		})

		return data
	}
}
