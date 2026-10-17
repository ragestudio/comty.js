import type { AuthModel } from ".."

import client from "../../../core/client"
import session from "../../../core/session"

type LoginPayload = {
	username: string
	password: string
	mfa_code?: string
}

type AuthResult = {
	expiresIn?: string
	refreshToken?: string
	token?: string
	user_id?: string

	activation_required?: boolean
	mfa_required?: boolean
}

export default async function (
	this: AuthModel,
	payload: LoginPayload,
	callback?: Function,
): Promise<AuthResult> {
	const response = await this.request<AuthResult>({
		method: "post",
		url: "/auth",
		data: payload,
	})

	if (response.data.mfa_required) {
		client.eventBus.emit("auth:mfa_required")

		if (typeof callback === "function") {
			await callback(response.data)
		}

		return response.data
	}

	if (response.data.activation_required) {
		client.eventBus.emit("auth:activation_required")

		if (typeof callback === "function") {
			await callback(response.data)
		}

		return response.data
	}

	session.token = response.data.token
	session.refreshToken = response.data.refreshToken

	if (typeof callback === "function") {
		await callback(response.data)
	}

	client.eventBus.emit("auth:login_success")

	return response.data
}
