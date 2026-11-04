import type { AuthEndpointResult } from "@comty/shared/types/auth"
import type { AuthModel } from ".."

import client from "../../../core/client"
import session from "../../../core/session"

type LoginPayload = {
	username: string
	password: string
	mfa_code?: string
}

export default async function (
	this: AuthModel,
	payload: LoginPayload,
	callback?: Function,
): Promise<AuthEndpointResult> {
	const response = await this.request<AuthEndpointResult>({
		method: "post",
		url: "/auth",
		data: payload,
	})

	if (typeof callback === "function") {
		await callback(response.data)
	}

	if (response.data.mfa_required) {
		client.eventBus.emit("auth:mfa_required")

		return response.data
	}

	if (response.data.activation_required) {
		client.eventBus.emit("auth:activation_required")

		return response.data
	}

	session.token = response.data.token
	session.refreshToken = response.data.refreshToken

	client.eventBus.emit("auth:login_success")

	return response.data
}
