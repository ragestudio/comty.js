import type { AxiosInstance, InternalAxiosRequestConfig } from "axios"
import type { ClientOptions, EventEmitterLike } from "./types"

import EventEmitter from "@foxify/events"
import axios from "axios"
import xxhash, { XXHashAPI } from "xxhash-wasm"

import AddonsManager from "./classes/AddonsManager"
import WebsocketManager from "./classes/WebsocketManager"
import Storage from "./classes/Storage"
import remotes from "./remotes"

import pkg from "../package.json"

export class Client {
	static get isServerMode() {
		return typeof window === "undefined" && typeof global !== "undefined"
	}

	get version() {
		return pkg.version
	}

	eventBus: EventEmitterLike
	addons: AddonsManager
	ws: WebsocketManager
	baseRequest: AxiosInstance
	origin: string = remotes.origin
	decTokenStore = new Map()

	xxhashInstance: XXHashAPI

	constructor(options?: ClientOptions) {
		if (globalThis.__comty_shared_state) {
			return
		}

		// load the xxhash instance
		xxhash()
			.then((instance) => {
				this.xxhashInstance = instance
			})
			.catch((e) => {
				console.error(e)
			})

		// if origin is provided, use it
		if (typeof options.origin === "string") {
			this.origin = options.origin
		}

		// if credentials are provided, store them
		if (options.privateKey && options.accessKey && Client.isServerMode) {
			Storage.engine.set(
				"token",
				`${options.privateKey}:${options.accessKey}`,
			)
		}

		this.eventBus = options.eventBus ?? new EventEmitter()
		this.addons = new AddonsManager()
		this.baseRequest = axios.create({
			baseURL: this.origin,
			headers: {
				"Content-Type": "application/json",
			},
		})

		// register the request interceptor
		this.baseRequest.interceptors.request.use(
			this.requestInterceptorFullfilled,
			this.requestInterceptorRejected,
		)

		if (typeof options.ws === "object") {
			if (options.ws.enable === true) {
				this.ws = new WebsocketManager({
					origin: this.origin,
				})
			}

			if (options.ws.autoConnect === true) {
				this.ws.connectAll()
			}
		}

		globalThis.__comty_shared_state = this
	}

	private requestInterceptorFullfilled(config: InternalAxiosRequestConfig) {
		// check if current request has no Authorization header, if so, attach the token
		if (!config.headers["Authorization"]) {
			const sessionToken = Storage.engine.get("token")

			if (sessionToken) {
				config.headers["Authorization"] =
					`${globalThis.isServerMode ? "Server" : "Bearer"} ${sessionToken}`
			}
		}

		return config
	}

	private requestInterceptorRejected(error: any) {}
}

/**
 * Create a comty.js client
 */
export function createClient(options: ClientOptions) {
	return new Client(options)
}

export default Client
