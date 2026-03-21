import Remotes from "./remotes"
import Storage from "./helpers/withStorage"

import RTEngineClient from "linebridge-client/src/rtengine"

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
			url: `${this.origin}/${remote.path}`,
			token: () => Storage.engine.get("token"),
			worker: true,
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

		await socket.destroy()
		await socket.removeAllListeners()

		this.sockets.delete(key)
	}

	async reauthenticate() {
		for (const [key, socket] of this.sockets) {
			await socket.authenticate(() => Storage.engine.get("token"))
		}
	}

	async connectAll() {
		for (let [namespace, client] of this.sockets) {
			if (client.connected) {
				await this.destroyClient(namespace)
				this.sockets.set(namespace, this.createClient(client))
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
