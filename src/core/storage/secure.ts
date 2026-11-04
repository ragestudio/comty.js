import { StorageDriver } from "./storage"

export interface SecureStoreModule {
	getItemAsync(key: string): Promise<string | null>
	setItemAsync(key: string, value: string): Promise<void>
	deleteItemAsync(key: string): Promise<void>
}

export class SecureStoreStorageDriver implements StorageDriver {
	constructor(private store: SecureStoreModule) {}

	async getItem(key: string) {
		return (await this.store.getItemAsync(key)) ?? undefined
	}

	async setItem(key: string, value: string) {
		await this.store.setItemAsync(key, value)
	}

	async removeItem(key: string) {
		await this.store.deleteItemAsync(key)
	}
}

export default SecureStoreStorageDriver
