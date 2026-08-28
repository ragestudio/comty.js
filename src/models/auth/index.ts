import BaseModel from "../../classes/BaseModel"
import { Definition } from "../../decorators/Definition"

import SessionModel from "../session"
import loginMethod from "./methods/login"
import register from "./methods/register"
import disableAccount from "./methods/disableAccount"

export class AuthModel extends BaseModel {
	get SessionModel() {
		return SessionModel
	}

	/**
	 * Async function to handle the login process
	 */
	login = loginMethod.bind(this) as OmitThisParameter<typeof loginMethod>

	/**
	 * Asynchronously logs out the user by destroying the current session
	 * and emitting a event for successful logout
	 */
	async logout(): Promise<void> {
		await SessionModel.destroyCurrentSession()
		await SessionModel.removeToken()

		__comty_shared_state.eventBus.emit("auth:logout_success")
	}

	/**
	 * Registers a new user with the provided payload
	 */
	register = register.bind(this) as OmitThisParameter<typeof register>

	/**
	 * Verifies the given token and returns the user data associated with it
	 */
	@Definition((token) => ({
		method: "POST",
		url: "/auth/token",
		data: { token },
	}))
	authToken: (token?: string) => Promise<object>

	/**
	 * Validates the existence/validity of a username
	 */
	@Definition((username) => ({
		method: "get",
		url: `/auth/${username}/exists`,
	}))
	usernameValidation: (username: string) => Promise<boolean | object>

	/**
	 * Retrieves the availability of a username and email
	 */
	@Definition((payload) => ({
		method: "get",
		url: `/availability`,
		params: {
			username: payload.username,
			email: payload.email,
		},
	}))
	availability: (payload: { username: string; email: string }) => Promise<object | boolean>

	/**
	 * Changes the current logged user password
	 */
	@Definition((payload) => ({
		method: "put",
		url: "/auth/password",
		data: {
			code: payload.code,
			verificationToken: payload.verificationToken,
			old_password: payload.currentPassword,
			new_password: payload.newPassword,
		},
	}))
	changePassword: (payload: {
		currentPassword: string
		newPassword: string
		code?: string
		verificationToken?: string
	}) => Promise<object>

	/**
	 * Activates a user account using the provided activation code
	 */
	@Definition((user_id, code) => ({
		method: "post",
		url: "/auth/activate",
		data: {
			code: code,
			user_id: user_id,
		},
	}))
	activateAccount: (user_id: string, code: string) => Promise<object>

	/**
	 * Resends the activation code to the user
	 */
	@Definition((user_id) => ({
		method: "post",
		url: "/auth/resend-activation-code",
		data: { user_id },
	}))
	resendActivationCode: (user_id: string) => Promise<object>

	/**
	 * Disables the current user account
	 */
	disableAccount = disableAccount.bind(this) as OmitThisParameter<
		typeof disableAccount
	>

	/**
	 * Start password recovery for the given username or email
	 */
	@Definition((usernameOrEmail) => ({
		method: "post",
		url: "/auth/recover-password",
		data: { account: usernameOrEmail },
	}))
	recoverPassword: (usernameOrEmail: string) => Promise<object>
}

export default new AuthModel()
