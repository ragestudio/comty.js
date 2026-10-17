import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@linebridge/client", () => {
	class WebsocketClient {
		params: any
		state = { connected: false }

		constructor(params: any) {
			this.params = params
		}

		on() {}
		once() {}
		emit() {}

		async connect() {}
		async authenticate() {}
		destroy() {}
	}

	return { WebsocketClient }
})

import { Client } from "../src/core/client"
import remotes from "../src/core/remotes"
import { MemoryStorageDriver } from "../src/core/storage/storage"
import session from "../src/core/session"

type MockResponse = { status: number; data?: any }

// a minimal axios adapter that resolves 2xx and throws for the rest
function adapterFrom(handler: (config: any) => MockResponse) {
	return async (config: any) => {
		const { status, data } = handler(config)
		const response = { data, status, statusText: "", headers: {}, config }

		if (status >= 200 && status < 300) return response

		const error: any = new Error(`Request failed with status ${status}`)
		error.config = config
		error.response = response
		error.isAxiosError = true

		throw error
	}
}

function getHeader(config: any, name: string): any {
	const headers = config?.headers
	if (headers && typeof headers.get === "function") {
		const value = headers.get(name)
		if (value != null) return value
	}
	return headers?.[name]
}

describe("Client", () => {
	beforeEach(() => {
		session.deleteToken()
		session.deleteRefreshToken()
	})

	afterEach(() => {
		session.deleteToken()
		session.deleteRefreshToken()
	})

	it("attaches the bearer token from the session", async () => {
		session.token = "tok"

		const client = new Client()
		let authorization: any

		client.instance.defaults.adapter = adapterFrom((config) => {
			authorization = getHeader(config, "Authorization")
			return { status: 200, data: { ok: true } }
		})

		const response = await client.instance.get("/users/self")

		expect(authorization).toBe("Bearer tok")
		expect(response.data).toEqual({ ok: true })
	})

	it("refreshes before a request and skips the auth endpoints", async () => {
		session.token = "tok"

		const client = new Client()
		const ensureFreshToken = vi.fn(async () => {})

		client.registerAuthPlugin({ ensureFreshToken })
		client.instance.defaults.adapter = adapterFrom(() => ({
			status: 200,
			data: {},
		}))

		await client.instance.get("/users/self")
		expect(ensureFreshToken).toHaveBeenCalledTimes(1)

		ensureFreshToken.mockClear()
		await client.instance.post("/auth", { refreshToken: "r" })
		expect(ensureFreshToken).not.toHaveBeenCalled()
	})

	it("refreshes and retries once on a 401", async () => {
		session.token = "tok"

		const client = new Client()
		const onUnauthorized = vi.fn(async () => true)

		let calls = 0
		client.instance.defaults.adapter = adapterFrom(() => {
			calls += 1
			return calls === 1
				? { status: 401, data: { expired: true } }
				: { status: 200, data: { ok: true } }
		})

		client.registerAuthPlugin({ onUnauthorized })

		const response = await client.instance.get("/protected")

		expect(response.status).toBe(200)
		expect(calls).toBe(2)
		expect(onUnauthorized).toHaveBeenCalledTimes(1)
	})

	it("propagates the error when the refresh fails", async () => {
		session.token = "tok"

		const client = new Client()
		client.instance.defaults.adapter = adapterFrom(() => ({
			status: 401,
			data: {},
		}))
		client.registerAuthPlugin({ onUnauthorized: async () => false })

		await expect(client.instance.get("/protected")).rejects.toThrow()
	})

	it("retries transient 5xx errors with a backoff", async () => {
		const client = new Client()

		let calls = 0
		client.instance.defaults.adapter = adapterFrom(() => {
			calls += 1
			return calls < 3
				? { status: 503, data: {} }
				: { status: 200, data: { ok: true } }
		})

		const response = await client.instance.get("/flaky", {
			retryDelay: 1,
			maxRetries: 3,
		} as any)

		expect(response.status).toBe(200)
		expect(calls).toBe(3)
	})

	it("skips the auth handling when skipAuth is set", async () => {
		session.token = "tok"

		const client = new Client()
		const ensureFreshToken = vi.fn(async () => {})
		let authorization: any = "unset"

		client.registerAuthPlugin({ ensureFreshToken })
		client.instance.defaults.adapter = adapterFrom((config) => {
			authorization = getHeader(config, "Authorization")
			return { status: 200, data: {} }
		})

		await client.instance.get("/public", { skipAuth: true } as any)

		expect(ensureFreshToken).not.toHaveBeenCalled()
		expect(authorization == null).toBe(true)
	})

	it("updates the axios base url and the socket origin", () => {
		const client = new Client()

		client.origin = "http://localhost:1234"

		expect(client.instance.defaults.baseURL).toBe("http://localhost:1234")
		expect(client.ws.get("main")?.params.url).toBe("ws://localhost:1234/ws")
	})

	it("accepts a custom origin from the constructor", () => {
		const client = new Client({ origin: "http://localhost:7777" })

		expect(client.origin).toBe("http://localhost:7777")
		expect(client.instance.defaults.baseURL).toBe("http://localhost:7777")
	})

	it("persists a custom origin across instances", async () => {
		const driver = new MemoryStorageDriver()

		const first = new Client()
		await first.useStorageDriver(driver)
		first.setOrigin("http://localhost:9999")

		const second = new Client()
		await second.useStorageDriver(driver)

		expect(second.origin).toBe("http://localhost:9999")
		expect(second.instance.defaults.baseURL).toBe("http://localhost:9999")
		expect(second.ws.get("main")?.params.url).toBe("ws://localhost:9999/ws")
	})

	it("resets the origin back to the default", () => {
		const client = new Client()

		client.setOrigin("http://localhost:4321")
		expect(client.origin).toBe("http://localhost:4321")

		client.resetOrigin()
		expect(client.origin).toBe(remotes.origin)
		expect(client.instance.defaults.baseURL).toBe(remotes.origin)
	})
})
