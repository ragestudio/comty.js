import type { WebsocketClient } from "@linebridge/client"
import type { WebsocketRemote } from "../remotes"
import type {
	RealtimeAction,
	RealtimeOptions,
	ResolvedRealtimeOptions,
} from "./types"

import { resolveRealtimeOptions } from "./config"
import { createSocket } from "./sockets"
import { bindAuthEvents } from "./auth-bindings"

export class Realtime {
	sockets = new Map<string, WebsocketClient>()

	private options: ResolvedRealtimeOptions
	private _origin: string
	private unbinders: Array<() => void> = []

	constructor(options: RealtimeOptions = {}) {
		this.options = resolveRealtimeOptions(options)
		this._origin = this.options.origin

		this.createSockets()

		if (this.options.autoManage && this.options.eventBus) {
			this.unbinders = bindAuthEvents(
				this.options.eventBus,
				(action) => this.runAction(action),
				this.options.logger,
			)
		}
	}

	get socket() {
		return this.sockets.get("main")
	}

	get origin() {
		return this._origin
	}

	set origin(origin: string) {
		this.setOrigin(origin)
	}

	get namespaces() {
		return [...this.sockets.keys()]
	}

	// point the sockets to another origin, recreating them
	setOrigin(origin: string) {
		if (origin === this._origin) return

		this._origin = origin

		for (const namespace of this.namespaces) {
			this.sockets.get(namespace)?.destroy()
		}

		this.createSockets()
	}

	has(namespace: string) {
		return this.sockets.has(namespace)
	}

	get(namespace: string) {
		return this.sockets.get(namespace)
	}

	async connect(namespace: string) {
		const socket = this.sockets.get(namespace)

		if (!socket) return false

		if (socket.state.connected) {
			await this.reauthenticate(namespace)
			return true
		}

		await socket.connect()

		return true
	}

	async connectAll() {
		const results = await Promise.allSettled(
			this.namespaces.map((namespace) => this.connect(namespace)),
		)

		for (const result of results) {
			if (result.status === "rejected") {
				this.options.logger.error(
					"failed to connect a socket",
					result.reason,
				)
			}
		}

		this.emit("wsmanager:all:connected")

		return true
	}

	async disconnect(namespace: string) {
		const socket = this.sockets.get(namespace)

		if (!socket) return false

		// destroy clears the handlers, so recreate the socket for future use
		socket.destroy()
		this.recreateSocket(namespace)

		return true
	}

	async disconnectAll() {
		for (const namespace of this.namespaces) {
			await this.disconnect(namespace)
		}

		this.emit("wsmanager:all:disconnected")

		return true
	}

	async reauthenticate(namespace?: string) {
		const targets = namespace ? [namespace] : this.namespaces

		await Promise.all(
			targets.map(async (name) => {
				const socket = this.sockets.get(name)

				if (!socket || !socket.state.connected) return

				const token = await this.options.getToken()

				if (!token) return

				await socket.authenticate(token)
			}),
		)

		return true
	}

	// remove the auth bindings and close every socket
	destroy() {
		for (const unbind of this.unbinders) unbind()
		this.unbinders = []

		for (const socket of this.sockets.values()) {
			socket.destroy()
		}

		this.sockets.clear()
	}

	private createSockets() {
		for (const remote of this.options.remotes) {
			this.sockets.set(remote.namespace, this.createClient(remote))
		}
	}

	private recreateSocket(namespace: string) {
		const remote = this.options.remotes.find(
			(remote) => remote.namespace === namespace,
		)

		if (!remote) return

		this.sockets.set(namespace, this.createClient(remote))
	}

	private createClient(remote: WebsocketRemote) {
		return createSocket(
			remote,
			this.options,
			this._origin,
			(event, data) => {
				this.emit(`wsmanager:${remote.namespace}:${event}`, data)
			},
		)
	}

	private async runAction(action: RealtimeAction) {
		if (action === "connect") return this.connectAll()
		if (action === "reauthenticate") return this.reauthenticate()

		return this.disconnectAll()
	}

	private emit(event: string, ...args: any[]) {
		this.options.eventBus?.emit(event, ...args)
	}
}

export default Realtime
