import EventEmitter from "@foxify/events"
import xxhash from "xxhash-wasm"

export default class FileUploadBrowser {
	constructor(params) {
		const {
			endpoint,
			file,
			headers = {},
			splitChunkSize = 1024 * 1024 * 10,
			maxRetries = 3,
			delayBeforeRetry = 5,
			concurrency = 3,
		} = params

		if (!endpoint) {
			throw new Error("Missing endpoint")
		}

		if (!(file instanceof File)) {
			throw new Error("Invalid or missing file")
		}

		if (typeof headers !== "object") {
			throw new Error("Invalid headers")
		}

		if (splitChunkSize <= 0) {
			throw new Error("Invalid splitChunkSize")
		}

		this.splitChunkSize = splitChunkSize
		this.totalChunks = Math.ceil(file.size / splitChunkSize)

		this.maxRetries = maxRetries
		this.delayBeforeRetry = delayBeforeRetry
		this.concurrency = concurrency

		this.completedChunks = 0
		this.activeUploads = 0
		this.hasFatalError = false
		this.chunkRetries = new Map()

		this.pendingChunks = Array.from(
			{ length: this.totalChunks },
			(_, i) => i,
		)

		this.offline = false
		this.paused = false

		this.endpoint = endpoint
		this.file = file
		this.headers = {
			...headers,
			"uploader-file-id": this.getFileUID(file),
			"uploader-file-hash": null,
			"uploader-original-name": encodeURIComponent(file.name),
			"uploader-chunks-total": this.totalChunks,
			"chunk-size": splitChunkSize,
			"cache-control": "no-cache",
			connection: "keep-alive",
		}

		window.addEventListener("online", () => {
			if (this.offline) {
				this.offline = false
				this.events.emit("online")
				this.processNext()
			}
		})

		window.addEventListener("offline", () => {
			this.offline = true
			this.events.emit("offline")
		})

		this.websocket =
			globalThis.__comty_shared_state?.ws?.sockets?.get("main") ?? null
		this.websocketJobEvent = `job:${this.headers["uploader-file-id"]}`

		if (!this.websocket) {
			console.warn(
				"Cannot listen to job events over websocket. Socket/Context no available",
			)
		} else {
			this.websocket.on(
				this.websocketJobEvent,
				this.handleJobWebsocketEvent,
			)
		}
	}

	events = new EventEmitter()

	start = async () => {
		const fileHash = await this.getFileHash(this.file)

		if (fileHash) {
			this.headers["uploader-file-hash"] = fileHash
		}

		this.processNext()
	}

	getFileUID(file) {
		return (
			Math.floor(Math.random() * 100000000) +
			Date.now() +
			file.size +
			"_tmp"
		)
	}

	async getFileHash(file) {
		if (!(file instanceof File)) {
			throw new Error("file must be a instance of File")
		}

		if (globalThis.xxhash) {
			const hasher = window.xxhash.create64(0n)

			const stream = file.stream()
			const reader = stream.getReader()

			while (true) {
				const { done, value } = await reader.read()

				if (done) {
					break
				}

				hasher.update(value)
			}

			return hasher.digest().toString(16).padStart(16, "0")
		}

		return null
	}

	getChunkBlob(chunkIndex) {
		const start = chunkIndex * this.splitChunkSize
		const end = Math.min(start + this.splitChunkSize, this.file.size)
		return this.file.slice(start, end, "application/octet-stream")
	}

	processNext = () => {
		if (this.paused || this.offline || this.hasFatalError) {
			return
		}

		while (
			this.activeUploads < this.concurrency &&
			this.pendingChunks.length > 0
		) {
			if (
				this.pendingChunks[0] === this.totalChunks - 1 &&
				this.activeUploads > 0
			) {
				break
			}

			const chunkIndex = this.pendingChunks.shift()
			this.activeUploads++
			this.uploadChunk(chunkIndex)
		}
	}

	async uploadChunk(chunkIndex) {
		console.log(`[UPLOADER] Starting chunk ${chunkIndex}`)
		const chunkBlob = this.getChunkBlob(chunkIndex)

		try {
			const res = await fetch(this.endpoint, {
				method: "POST",
				headers: {
					...this.headers,
					"uploader-chunk-number": chunkIndex,
				},
				body: chunkBlob,
			})

			if (![200, 201, 204].includes(res.status)) {
				throw new Error(`HTTP Error ${res.status}`)
			}

			const data = await res.json().catch(() => ({}))

			this.completedChunks++
			this.activeUploads--

			this.events.emit("progress", {
				percent: Math.round(
					(100 / this.totalChunks) * this.completedChunks,
				),
				state: "Uploading",
			})

			console.debug(
				`[UPLOADER] Chunk ${chunkIndex} sent. (${this.completedChunks}/${this.totalChunks})`,
			)

			this.processNext()

			if (this.completedChunks === this.totalChunks) {
				if (!data.useWebsocketEvents) {
					this.events.emit("finish", data)
				}
			}
		} catch (error) {
			this.activeUploads--
			this.handleRetry(chunkIndex, error)
		}
	}

	handleRetry(chunkIndex, error) {
		if (this.hasFatalError) {
			return
		}

		const retries = this.chunkRetries.get(chunkIndex) || 0

		if (retries < this.maxRetries) {
			this.chunkRetries.set(chunkIndex, retries + 1)

			this.events.emit("fileRetry", {
				message: `Retrying chunk ${chunkIndex}`,
				chunk: chunkIndex,
				retriesLeft: this.maxRetries - (retries + 1),
			})

			setTimeout(() => {
				if (!this.hasFatalError) {
					this.pendingChunks.unshift(chunkIndex)
					this.processNext()
				}
			}, this.delayBeforeRetry * 1000)

			//this.processNext()
		} else {
			this.hasFatalError = true
			this.events.emit("error", {
				message: `No more retries for chunk ${chunkIndex}`,
				error,
			})
		}
	}

	togglePause() {
		this.paused = !this.paused

		if (!this.paused) {
			this.processNext()
		}
	}

	handleJobWebsocketEvent = (data) => {
		if (data.event === "done") {
			this.events.emit("finish", data.result)
			this.websocket.off(
				this.websocketJobEvent,
				this.handleJobWebsocketEvent,
			)
		}

		if (data.event === "error") {
			this.events.emit("error", data.result)
			this.websocket.off(
				this.websocketJobEvent,
				this.handleJobWebsocketEvent,
			)
		}

		if (data.state) {
			this.events.emit("progress", {
				percent: data.percent,
				state: data.state,
			})
		}
	}
}
