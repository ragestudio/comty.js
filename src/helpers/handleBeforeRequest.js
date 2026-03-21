import Session from "../models/session"
import refreshToken from "./refreshToken"

export default async () => {
	// await to token being refreshed
	if (__comty_shared_state.refreshingToken === true) {
		await new Promise((resolve) => {
			__comty_shared_state.eventBus.once("session:refreshed", resolve)
		})
	}

	if (Session.isTokenExpired) {
		console.log(`Session expired, trying to regenerate...`)
		await refreshToken()
	}
}
