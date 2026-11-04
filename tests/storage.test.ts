import { describe, expect, it } from "vitest"

import { CookieStorageDriver } from "../src/core/storage/cookie"
import { MemoryStorageDriver } from "../src/core/storage/memory"
import Storage, { resolveStorageDriver } from "../src/core/storage/storage"

describe("storage engine", () => {
	it("resolves to the memory driver outside the browser", () => {
		expect(resolveStorageDriver()).toBeInstanceOf(MemoryStorageDriver)
	})

	it("keeps a sync mirror while writing through the driver", async () => {
		const storage = new Storage<string>(new MemoryStorageDriver())

		expect(storage.get("token")).toBeUndefined()

		await storage.set("token", "abc")
		expect(storage.get("token")).toBe("abc")

		await storage.delete("token")
		expect(storage.get("token")).toBeUndefined()
	})

	it("hydrates and primes from the driver", async () => {
		const driver = new MemoryStorageDriver()
		await driver.setItem("a", "1")

		const storage = new Storage<string>(driver)

		storage.prime(["a"])
		expect(storage.get("a")).toBe("1")

		await driver.setItem("b", "2")
		await storage.hydrate(["b"])
		expect(storage.get("b")).toBe("2")
	})

	it("treats undefined values as a delete", async () => {
		const storage = new Storage<string>(new MemoryStorageDriver())

		await storage.set("token", "abc")
		await storage.set("token", undefined)

		expect(storage.get("token")).toBeUndefined()
	})

	it("cookie driver is a no-op without a document", () => {
		const driver = new CookieStorageDriver()

		expect(driver.getItem("token")).toBeUndefined()
	})
})
