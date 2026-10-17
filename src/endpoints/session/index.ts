import { Definition } from "../../core/endpoint/decorators/Definition"

import client from "../../core/client"
import BaseEndpoint from "../../core/endpoint/BaseEndpoint"
import session from "../../core/session"

export class Session extends BaseEndpoint {
	/**
	 * Retrieves all sessions from the server.
	 */
	@Definition(() => ({
		method: "get",
		url: "/sessions/all",
	}))
	getAllSessions!: () => Promise<any>

	/**
	 * Retrieves the current session from the server.
	 */
	@Definition(() => ({
		method: "get",
		url: "/sessions/current",
	}))
	getCurrentSession!: () => Promise<any>

	/**
	 * Destroys all sessions
	 */
	@Definition(() => ({
		method: "delete",
		url: "/sessions/all",
	}))
	destroyAll!: () => Promise<any>

	/**
	 * Destroys the current session by deleting it from the server.
	 */
	async destroyCurrentSession() {
		const response = await this.request({
			method: "delete",
			url: "/auth",
		}).catch((error) => {
			console.error(error)
			return false as any
		})

		session.deleteToken()
		session.deleteRefreshToken()

		client.eventBus.emit("session:destroyed")

		return response ? response.data : false
	}
}

export default new Session()
