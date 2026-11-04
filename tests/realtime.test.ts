import { EventEmitter } from "node:events"

import { describe, expect, it, vi } from "vitest"

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

		async connect() {
			this.state.connected = true
		}
		async authenticate() {}
		destroy() {}
	}

	return { WebsocketClient }
})

import Realtime from "../src/core/realtime"

const tick = () => new Promise((resolve) => setTimeout(resolve, 10))

function createRealtime(eventBus?: EventEmitter) {
	return new Realtime({
		origin: "https://api.comty.app",
		eventBus: eventBus as any,
		remotes: [{ namespace: "main", path: "/ws" }],
		getToken: () => "tok",
		autoManage: Boolean(eventBus),
	})
}

describe("Realtime", () => {
	it("registers the remotes and builds ws urls", () => {
		const manager = createRealtime()

		expect(manager.has("main")).toBe(true)
		expect(manager.get("main")?.params.url).toBe("wss://api.comty.app/ws")

		manager.setOrigin("http://localhost:5000")
		expect(manager.get("main")?.params.url).toBe("ws://localhost:5000/ws")
	})

	it("drives the sockets from the auth events", async () => {
		const bus = new EventEmitter()
		const manager = createRealtime(bus)
		const client = manager.get("main") as any

		const connect = vi.spyOn(client, "connect")

		bus.emit("auth:login_success")
		await tick()
		expect(connect).toHaveBeenCalled()

		client.state.connected = true
		const authenticate = vi.spyOn(client, "authenticate")
		bus.emit("session:refreshed")
		await tick()
		expect(authenticate).toHaveBeenCalledWith("tok")

		const destroy = vi.spyOn(client, "destroy")
		bus.emit("auth:logout_success")
		await tick()
		expect(destroy).toHaveBeenCalled()
	})
})
