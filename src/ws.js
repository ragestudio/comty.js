import Remotes from "./remotes"
import Storage from "./helpers/withStorage"

import { RTEngineClient } from "linebridge-client"

class WebsocketManager {
	constructor({ origin }) {
		this.origin = origin

		for (const remote of Remotes.websockets) {
			this.sockets.set(remote.namespace, this.createClient(remote))
		}
	}

	sockets = new Map()

	createClient(remote) {
		const client = new RTEngineClient({
			refName: remote.namespace,
			url: `${this.origin}/${remote.namespace}`,
			token: Storage.engine.get("token"),
		})

		client.on("open", () => {
			globalThis.__comty_shared_state.eventBus.emit(
				`wsmanager:${remote.namespace}:open`,
			)
		})

		client.on("close", () => {
			globalThis.__comty_shared_state.eventBus.emit(
				`wsmanager:${remote.namespace}:close`,
			)
		})

		client.on("reconnecting", () => {
			globalThis.__comty_shared_state.eventBus.emit(
				`wsmanager:${remote.namespace}:reconnecting`,
			)
		})

		client.on("reconnected", () => {
			globalThis.__comty_shared_state.eventBus.emit(
				`wsmanager:${remote.namespace}:reconnected`,
			)
		})

		client.on("error", (error) => {
			globalThis.__comty_shared_state.eventBus.emit(
				`wsmanager:${remote.namespace}:error`,
				error,
			)
		})

		return client
	}

	async destroyClient(key) {
		const socket = this.sockets.get(key)

		if (!socket) {
			return null
		}

		const isConnected =
			socket.connected === true || socket.state?.connected === true

		if (isConnected && typeof socket.destroy === "function") {
			await socket.destroy()
		}

		if (typeof socket.removeAllListeners === "function") {
			await socket.removeAllListeners()
		}

		this.sockets.delete(key)
	}

	async connectAll() {
		for (let [namespace, client] of this.sockets) {
			if (client.connected) {
				await this.destroyClient(client)
				client = this.createClient(client)
				this.sockets.set(client.namespace, client)
			}

			await client.connect()
		}

		globalThis.__comty_shared_state.eventBus.emit("wsmanager:all:connected")
	}

	async disconnectAll() {
		for (const [key, socket] of this.sockets) {
			await this.destroyClient(key)
		}
	}
}

export default WebsocketManager
