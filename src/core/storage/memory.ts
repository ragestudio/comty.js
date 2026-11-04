import { StorageDriver } from "./storage"

export class MemoryStorageDriver implements StorageDriver {
	private store = new Map<string, string>()

	getItem(key: string) {
		return this.store.get(key)
	}

	setItem(key: string, value: string) {
		this.store.set(key, value)
	}

	removeItem(key: string) {
		this.store.delete(key)
	}
}
