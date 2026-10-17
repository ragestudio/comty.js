import type { User } from "@comty/shared/types/user"
import type { DecodedAuthToken } from "@comty/shared/types/session"
import type { StorageDriver } from "./storage/storage"

import { jwtDecode } from "jwt-decode"
import client from "./client"
import Storage from "./storage/storage"

type TokensTypes = "token" | "refresh"

const tokenKeys: TokensTypes[] = ["token", "refresh"]

class SessionTokensStorage extends Storage<TokensTypes> {}

class Session {
	user!: Partial<User>

	protected tokensStorage = new SessionTokensStorage()
	private hydration?: Promise<void>

	constructor() {
		this.tokensStorage.prime(tokenKeys)
	}

	restore() {
		if (!this.hydration) {
			this.hydration = this.tokensStorage.hydrate(tokenKeys)
		}

		return this.hydration
	}

	useStorageDriver(driver: StorageDriver) {
		this.tokensStorage.setDriver(driver)

		this.hydration = this.tokensStorage.hydrate(tokenKeys)

		return this.hydration
	}

	get token() {
		return this.tokensStorage.get("token")
	}
	set token(token: string | undefined) {
		this.tokensStorage.set("token", token)
	}
	deleteToken() {
		this.tokensStorage.delete("token")
	}

	get refreshToken() {
		return this.tokensStorage.get("refresh")
	}
	set refreshToken(token: string | undefined) {
		this.tokensStorage.set("refresh", token)
	}
	deleteRefreshToken() {
		this.tokensStorage.delete("refresh")
	}

	get decodedToken(): DecodedAuthToken | null {
		if (!this.token) return null

		try {
			return jwtDecode<DecodedAuthToken>(this.token)
		} catch {
			return null
		}
	}

	get isTokenExpired(): boolean | null {
		let token = this.token

		if (!token) return null

		if (!client.decTokenStore.has(token)) {
			client.decTokenStore.clear()
			client.decTokenStore.set(token, jwtDecode(token))
		}

		const decoded = client.decTokenStore.get(token)

		if (!decoded) return null

		return decoded.exp < Date.now() / 1000
	}

	get tokenExpiration(): number | undefined {
		if (!this.token) return undefined

		return this.decodedToken?.exp
	}

	get user_id(): string | undefined {
		return this.decodedToken?.user_id
	}
}

export default new Session()
