import SessionModel from "../models/session"

export default async () => {
	if (__comty_shared_state) {
		__comty_shared_state.eventBus.emit("session:refreshing")
		__comty_shared_state.refreshingToken = true
	}

	let response

	try {
		// send request to regenerate token
		response = await __comty_shared_state.baseRequest({
			method: "POST",
			url: "/auth",
			data: {
				authToken: await SessionModel.token,
				refreshToken: await SessionModel.refreshToken,
			},
		})

		if (!response.data?.token) {
			throw new Error(
				"Failed to regenerate token, invalid server response.",
			)
		}

		// set new token
		SessionModel.token = response.data.token
		SessionModel.refreshToken = response.data.refreshToken

		// emit event
		__comty_shared_state.eventBus.emit("session:refreshed")
		__comty_shared_state.refreshingToken = false
	} catch (err) {
		__comty_shared_state.refreshingToken = false

		if (response?.status !== 200) {
			throw new Error("Failed to regenerate token.")
		} else {
			throw err
		}
	}

	return true
}
