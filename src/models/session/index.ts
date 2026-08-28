import BaseModel from "../../classes/BaseModel"
import { jwtDecode } from "jwt-decode"
import Storage from "../../classes/Storage"

import { Definition } from "../../decorators/Definition"

export class Session extends BaseModel {
	storageTokenKey = "token"
	storageRefreshTokenKey = "refreshToken"

	/**
	 * Retrieves the token from the storage engine.
	 */
	get token(): string | undefined {
		return Storage.engine.get(this.storageTokenKey)
	}

	/**
	 * Sets the token in the storage engine.
	 */
	set token(token: string | undefined) {
		Storage.engine.set(this.storageTokenKey, token, {
			path: "/",
			sameSite: "Strict",
			expires: 1460,
		})
	}

	/**
	 * Retrieves the refresh token from the storage engine.
	 */
	get refreshToken(): string | undefined {
		return Storage.engine.get(this.storageRefreshTokenKey)
	}

	/**
	 * Sets the refresh token in the storage engine.
	 */
	set refreshToken(token: string | undefined) {
		Storage.engine.set(this.storageRefreshTokenKey, token, {
			path: "/",
			sameSite: "Strict",
			expires: 1460,
		})
	}

	/**
	 * Checks if the token is expired.
	 */
	get isTokenExpired(): boolean | null {
		if (!globalThis.__comty_shared_state) {
			return null
		}

		let token = this.token
		if (!token) {
			return null
		}

		if (!globalThis.__comty_shared_state.decTokenStore.has(token)) {
			globalThis.__comty_shared_state.decTokenStore.clear()
			globalThis.__comty_shared_state.decTokenStore.set(
				token,
				jwtDecode(token),
			)
		}

		const decoded = globalThis.__comty_shared_state.decTokenStore.get(token)
		if (!decoded) return null

		return decoded.exp < Date.now() / 1000
	}

	get tokenExpiration(): number | undefined {
		const token = this.token
		return token ? jwtDecode<any>(token).exp : undefined
	}

	/**
	 * Retrieves the roles from the decoded token object.
	 */
	get roles(): string[] | undefined {
		return this.getDecodedToken()?.roles
	}

	/**
	 * Retrieves the user ID from the decoded token object.
	 */
	get user_id(): string | undefined {
		return this.getDecodedToken()?.user_id
	}

	/**
	 * Retrieves the decoded token from the session storage.
	 */
	getDecodedToken(): any | null {
		const token = this.token
		return token ? jwtDecode(token) : null
	}

	/**
	 * Removes the token from the storage engine.
	 */
	removeToken() {
		return Storage.engine.remove(this.storageTokenKey)
	}

	/**
	 * Retrieves all sessions from the server.
	 */
	@Definition(() => ({
		method: "get",
		url: "/sessions/all",
	}))
	getAllSessions: () => Promise<any>

	/**
	 * Retrieves the current session from the server.
	 */
	@Definition(() => ({
		method: "get",
		url: "/sessions/current",
	}))
	getCurrentSession: () => Promise<any>

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

		this.removeToken()
		__comty_shared_state.eventBus.emit("session:destroyed")

		return response ? response.data : false
	}

	/**
	 * Destroys all sessions
	 */
	@Definition(() => ({
		method: "delete",
		url: "/sessions/all",
	}))
	destroyAll: () => Promise<any>
}

export default new Session()
