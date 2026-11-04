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
	private driver?: StorageDriver
	private fallbackDriver?: StorageDriver

	// the driver is resolved lazily so that a global driver registered after
	// this instance is created (native secure store) is still honored
	constructor(driver?: StorageDriver) {
		this.driver = driver
	}

	setDriver(driver: StorageDriver) {
		this.driver = driver
	}

	private getDriver() {
		if (this.driver) return this.driver
		if (registeredDriver) return registeredDriver

		// keep the fallback per instance, a memory driver is stateful
		if (!this.fallbackDriver) {
			this.fallbackDriver = resolveStorageDriver()
		}

		return this.fallbackDriver
	}

	get(key: K): string | undefined {
		return this.cache.get(key)
	}

	set(key: K, value: string | undefined) {
		if (value == null) return this.delete(key)

		this.cache.set(key, value)

		return this.persist(() => this.getDriver().setItem(key, value))
	}

	delete(key: K) {
		this.cache.delete(key)

		return this.persist(() => this.getDriver().removeItem(key))
	}

	prime(keys: K[]) {
		for (const key of keys) {
			try {
				const value = this.getDriver().getItem(key)

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
					const value = await this.getDriver().getItem(key)

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
