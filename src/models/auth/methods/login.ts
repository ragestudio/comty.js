import type { AuthModel } from ".."

export default async function (
	this: AuthModel,
	payload: object,
	callback: Function,
): Promise<object | boolean> {
	const response = await this.request({
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

	this.SessionModel.token = response.data.token
	this.SessionModel.refreshToken = response.data.refreshToken

	if (typeof callback === "function") {
		await callback(response.data)
	}

	__comty_shared_state.eventBus.emit("auth:login_success")

	return response.data
}
