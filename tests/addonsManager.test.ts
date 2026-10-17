import { describe, expect, it } from "vitest"

import AddonsManager from "../src/core/addons/AddonsManager"

describe("AddonsManager", () => {
	it("registers and retrieves addons by name", () => {
		const manager = new AddonsManager()
		const addon = { id: "music" }

		manager.register("music", addon)

		expect(manager.get("music")).toBe(addon)
		expect(manager.get("unknown")).toBeUndefined()
	})

	it("resolves addons that implement an operation", () => {
		const manager = new AddonsManager()

		class MusicAddon {
			static id = "music"
			getMyLibrary() {}
		}

		manager.register("music", new MusicAddon())
		manager.register("other", {})

		const refs = manager.getByOperation("getMyLibrary")

		expect(refs).toHaveLength(1)
		expect(refs[0].id).toBe("music")
		expect(typeof refs[0].fn).toBe("function")
	})
})
