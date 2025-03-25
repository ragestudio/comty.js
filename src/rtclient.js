export class RTEngineClient {
	constructor(params = {}) {
		this.params = params
	}

	socket = null

	stateSubscribers = []

	joinedTopics = new Set()
	handlers = new Set()

	async connect() {
		return new Promise((resolve, reject) => {
			if (this.socket) {
				this.disconnect()
			}

			let url = `${this.params.url}`

			if (this.params.token) {
				url += `?token=${this.params.token}`
			}

			this.socket = new WebSocket(url)

			this.socket.onopen = () => {
				resolve()
				this._emit("connect")
			}
			this.socket.onclose = () => {
				this._emit("disconnect")
			}
			this.socket.onerror = () => {
				reject()
				this._emit("error")
			}
			this.socket.onmessage = (event) => this.handleMessage(event)
		})
	}

	async disconnect() {
		if (!this.socket) {
			return false
		}

		for await (const topic of this.joinedTopics) {
			this.leaveTopic(topic)
		}

		this.socket.close()
		this.socket = null
	}

	_emit(event, data) {
		for (const handler of this.handlers) {
			if (handler.event === event) {
				handler.handler(data)
			}
		}
	}

	on = (event, handler) => {
		this.handlers.add({
			event,
			handler,
		})
	}

	off = (event, handler) => {
		this.handlers.delete({
			event,
			handler,
		})
	}

	emit = (event, data) => {
		if (!this.socket) {
			throw new Error("Failed to send, socket not connected")
		}

		this.socket.send(JSON.stringify({ event, data }))
	}

	joinTopic = (topic) => {
		this.emit("topic:join", topic)
		this.joinedTopics.add(topic)
	}

	leaveTopic = (topic) => {
		this.emit("topic:leave", topic)
		this.joinedTopics.delete(topic)
	}

	updateState(state) {
		this.stateSubscribers.forEach((callback) => callback(state))
	}

	//* HANDLERS
	handleMessage(event) {
		try {
			const payload = JSON.parse(event.data)

			if (typeof payload.event !== "string") {
				return false
			}

			if (payload.event === "error") {
				console.error(payload.data)
				return false
			}

			this._emit(payload.event, payload.data)
		} catch (error) {
			console.error("Error handling message:", error)
		}
	}

	// UPDATERS
	onStateChange(callback) {
		this.stateSubscribers.push(callback)

		return () => {
			this.stateSubscribers = this.stateSubscribers.filter(
				(cb) => cb !== callback,
			)
		}
	}
}

export default RTEngineClient
