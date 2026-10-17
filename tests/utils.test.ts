import { describe, expect, it } from "vitest"

import delay from "../src/utils/delay"
import isAuthEndpoint from "../src/utils/isAuthEndpoint"
import reduceStandardPaginatedMap from "../src/utils/reduceStandardPaginatedMap"

describe("isAuthEndpoint", () => {
	it("matches auth endpoints", () => {
		expect(isAuthEndpoint("/auth")).toBe(true)
		expect(isAuthEndpoint("/auth/password")).toBe(true)
		expect(isAuthEndpoint("/auth/token?foo=1")).toBe(true)
		expect(isAuthEndpoint("https://api.comty.app/auth")).toBe(true)
	})

	it("does not match other endpoints", () => {
		expect(isAuthEndpoint("/oauth/authorize")).toBe(false)
		expect(isAuthEndpoint("/users/self")).toBe(false)
		expect(isAuthEndpoint(undefined)).toBe(false)
	})
})

describe("reduceStandardPaginatedMap", () => {
	it("merges items and sums totals", () => {
		const result = reduceStandardPaginatedMap(
			{ items: [1, 2], total_items: 2 },
			{ items: [3], total_items: 1 },
		)

		expect(result.items).toEqual([1, 2, 3])
		expect(result.total_items).toBe(3)
	})

	it("handles empty inputs", () => {
		expect(reduceStandardPaginatedMap()).toEqual({
			items: [],
			total_items: 0,
			has_more: false,
		})
	})
})

describe("delay", () => {
	it("resolves after the given time", async () => {
		const start = Date.now()

		await delay(10)

		expect(Date.now() - start).toBeGreaterThanOrEqual(9)
	})
})
