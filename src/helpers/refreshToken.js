import SessionModel from "../models/session"

export default async () => {
	__comty_shared_state.eventBus.emit("session:refreshing")
	__comty_shared_state.refreshingToken = true

	// send request to regenerate token
	const response = await __comty_shared_state
		.baseRequest({
			method: "POST",
			url: "/auth",
			data: {
				authToken: await SessionModel.token,
				refreshToken: await SessionModel.refreshToken,
			},
		})
		.catch((error) => {
			return false
		})

	if (!response) {
		__comty_shared_state.refreshingToken = false

		throw new Error("Failed to regenerate token.")
	}

	if (!response.data?.token) {
		__comty_shared_state.refreshingToken = false

		throw new Error("Failed to regenerate token, invalid server response.")
	}

	// set new token
	SessionModel.token = response.data.token
	SessionModel.refreshToken = response.data.refreshToken

	// emit event
	__comty_shared_state.eventBus.emit("session:refreshed")
	__comty_shared_state.refreshingToken = false

	if (typeof __comty_shared_state.ws === "object") {
		await __comty_shared_state.ws.connectAll()
	}

	return true
}
