import { beforeEach, describe, expect, it, vi } from "vitest"
import EventEmitter from "@foxify/events"

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

vi.mock("../src/endpoints/user", () => ({
	default: {
		async data() {
			return { _id: "u1", user_id: "u1", username: "tester" }
		},
	},
}))

import {
	AuthManager,
	authStore,
	initialAuthState,
} from "../src/core/auth/index"
import session from "../src/core/session"

const b64 = (value: any) =>
	Buffer.from(JSON.stringify(value)).toString("base64url")

const jwt = (payload: Record<string, any>) =>
	`${b64({ alg: "none", typ: "JWT" })}.${b64(payload)}.sig`

const now = () => Math.floor(Date.now() / 1000)

const noopTransport = {
	login: async () => ({}),
	refresh: async () => ({}),
	logout: async () => {},
	fetchUser: async () => ({}) as any,
}

describe("AuthManager", () => {
	beforeEach(() => {
		session.deleteToken()
		session.deleteRefreshToken()
		authStore.setState({ ...initialAuthState })
	})

	it("boots without a session as unauthenticated", async () => {
		const auth = new AuthManager({
			autoRefresh: false,
			transport: noopTransport,
		})

		const booted = await auth.start()

		expect(booted).toBe(false)
		expect(authStore.getState().status).toBe("unauthenticated")
	})

	it("logs in, refreshes with dedupe and logs out", async () => {
		const tokenA = jwt({ user_id: "u1", exp: now() + 3600 })
		const tokenB = jwt({ user_id: "u1", exp: now() + 7200 })

		let refreshes = 0

		const auth = new AuthManager({
			autoRefresh: false,
			transport: {
				login: async () => ({ token: tokenA, refreshToken: "r1" }),
				refresh: async () => {
					refreshes += 1
					return { token: tokenB, refreshToken: "r2" }
				},
				fetchUser: async () =>
					({ _id: "u1", user_id: "u1", username: "tester" }) as any,
				logout: async () => {},
			},
		})

		await auth.login({ username: "a", password: "b" })
		expect(authStore.getState().authenticated).toBe(true)
		expect(auth.token).toBe(tokenA)
		expect(auth.user?.username).toBe("tester")

		await Promise.all([auth.refresh(), auth.refresh()])
		expect(refreshes).toBe(1)
		expect(auth.token).toBe(tokenB)

		await auth.logout()
		expect(authStore.getState().status).toBe("unauthenticated")
		expect(auth.token).toBeUndefined()
	})

	it("invalidates when refreshing without tokens", async () => {
		const auth = new AuthManager({
			autoRefresh: false,
			transport: noopTransport,
		})

		await auth.refresh().catch(() => {})

		expect(authStore.getState().status).toBe("invalid")
	})

	it("handles malformed tokens without throwing", () => {
		const auth = new AuthManager({
			autoRefresh: false,
			transport: noopTransport,
		})

		expect(auth.decode("not-a-jwt")).toBeNull()
	})

	it("emits events locally and mirrors them to the shared bus", async () => {
		const bus = new EventEmitter()
		const auth = new AuthManager({
			autoRefresh: false,
			transport: noopTransport,
			eventBus: bus,
		})

		const local = vi.fn()
		const mirrored = vi.fn()

		auth.on("auth:logout_success", local)
		bus.on("auth:logout_success", mirrored)

		await auth.logout()

		expect(local).toHaveBeenCalledTimes(1)
		expect(mirrored).toHaveBeenCalledTimes(1)
	})
})
