import isBrowser from "../../utils/isBrowser"
import { CookieStorageDriver } from "./cookie"
import { MemoryStorageDriver } from "./memory"

export type StorageValue = string | undefined
export type StorageResult<T> = T | Promise<T>

export interface StorageDriver {
	getItem(key: string): StorageResult<StorageValue>
	setItem(key: string, value: string): StorageResult<unknown>
	removeItem(key: string): StorageResult<unknown>
}

let registeredDriver: StorageDriver | undefined

export function registerStorageDriver(driver: StorageDriver) {
	registeredDriver = driver
}

export function resolveStorageDriver(): StorageDriver {
	if (registeredDriver) return registeredDriver

	if (isBrowser()) return new CookieStorageDriver()

	return new MemoryStorageDriver()
}

export class Storage<K extends string = string> {
	private cache = new Map<K, string>()
	private driver: StorageDriver

	constructor(driver: StorageDriver = resolveStorageDriver()) {
		this.driver = driver
	}

	setDriver(driver: StorageDriver) {
		this.driver = driver
	}

	get(key: K): string | undefined {
		return this.cache.get(key)
	}

	set(key: K, value: string | undefined) {
		if (value == null) return this.delete(key)

		this.cache.set(key, value)

		return this.persist(() => this.driver.setItem(key, value))
	}

	delete(key: K) {
		this.cache.delete(key)

		return this.persist(() => this.driver.removeItem(key))
	}

	prime(keys: K[]) {
		for (const key of keys) {
			try {
				const value = this.driver.getItem(key)

				if (!(value instanceof Promise) && value != null) {
					this.cache.set(key, value)
				}
			} catch (error) {
				console.warn("[comty.js] storage driver failed", error)
			}
		}
	}

	async hydrate(keys: K[]) {
		await Promise.all(
			keys.map(async (key) => {
				try {
					const value = await this.driver.getItem(key)

					if (value != null) this.cache.set(key, value)
				} catch (error) {
					console.warn("[comty.js] storage driver failed", error)
				}
			}),
		)
	}

	private async persist(operation: () => StorageResult<unknown>) {
		try {
			await operation()
		} catch (error) {
			console.warn("[comty.js] storage driver failed", error)
		}
	}
}

export default Storage
