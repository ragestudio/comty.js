import { StorageDriver } from "./storage"
import jscookies from "js-cookie"

export type SameSite = "Strict" | "strict" | "Lax" | "lax" | "None" | "none"

export type CookieStorageOptions = {
	path?: string
	sameSite?: SameSite
	expires?: number
	secure?: boolean
}

export class CookieStorageDriver implements StorageDriver {
	private options: CookieStorageOptions

	constructor(options: CookieStorageOptions = {}) {
		this.options = {
			path: "/",
			sameSite: "Strict",
			expires: 1460,
			...options,
		}
	}

	getItem(key: string) {
		return jscookies.get(key)
	}

	setItem(key: string, value: string) {
		jscookies.set(key, value, this.options)
	}

	removeItem(key: string) {
		jscookies.remove(key, this.options)
	}
}

export default CookieStorageDriver
