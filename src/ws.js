import Remotes from "./remotes"
import Storage from "./helpers/withStorage"

import { RTEngineClient } from "linebridge-client"
//import { RTEngineClient } from "../../linebridge/client/src"

class WebsocketManager {
	constructor({ origin }) {
		this.origin = origin
	}

	sockets = new Map()

	async connect(remote) {
		const client = new RTEngineClient({
			refName: remote.namespace,
			url: `${this.origin}/${remote.namespace}`,
			token: Storage.engine.get("token"),
		})

		client.on("connect", () => {
			globalThis.__comty_shared_state.eventBus.emit(
				`wsmanager:${remote.namespace}:connected`,
			)
		})

		client.on("disconnect", () => {
			globalThis.__comty_shared_state.eventBus.emit(
				`wsmanager:${remote.namespace}:disconnected`,
			)
		})

		client.on("error", (error) => {
			globalThis.__comty_shared_state.eventBus.emit(
				`wsmanager:${remote.namespace}:error`,
				error,
			)
		})

		await client.connect()

		this.sockets.set(remote.namespace, client)

		return client
	}

	async disconnect(key) {
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
		if (this.sockets.size > 0) {
			await this.disconnectAll()
		}

		for await (const remote of Remotes.websockets) {
			try {
				await this.connect(remote)
			} catch (error) {
				console.error(
					`Failed to connect to [${remote.namespace}]:`,
					error,
				)
				globalThis.__comty_shared_state.eventBus.emit(
					`wsmanager:${remote.namespace}:error`,
					error,
				)
			}
		}

		globalThis.__comty_shared_state.eventBus.emit("wsmanager:all:connected")
	}

	async disconnectAll() {
		for (const [key, socket] of this.sockets) {
			await this.disconnect(key)
		}
	}
}

export default WebsocketManager
