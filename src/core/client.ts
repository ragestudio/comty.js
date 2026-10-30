import type {
	AxiosError,
	AxiosInstance,
	InternalAxiosRequestConfig,
} from "axios"
import type { StorageDriver } from "./storage/storage"
import type { ClientAuthPlugin, ClientOptions } from "../types"

import pkg from "../../package.json"
import axios from "axios"
import { EventEmitter } from "tseep"

import AddonsManager from "./addons/AddonsManager"
import Realtime from "./realtime"
import session from "./session"
import Storage from "./storage/storage"

import delay from "../utils/delay"
import isAuthEndpoint from "../utils/isAuthEndpoint"
import remotes from "./remotes"

import { ORIGIN_STORAGE_KEY } from "./constants"

// keep the public types available from this module
export type { ClientAuthPlugin, ClientOptions } from "../types"

export class Client {
	readonly version = pkg.version
	private _origin: string = remotes.origin

	instance: AxiosInstance
	decTokenStore = new Map<string, Record<any, any>>()
	eventBus = new EventEmitter()
	addons = new AddonsManager()
	ws: Realtime

	private originStorage = new Storage<typeof ORIGIN_STORAGE_KEY>()
	private authPlugin?: ClientAuthPlugin

	get origin(): string {
		return this._origin
	}

	set origin(origin: string) {
		this.setOrigin(origin)
	}

	constructor(options: ClientOptions = {}) {
		this.originStorage.prime([ORIGIN_STORAGE_KEY])

		this._origin =
			this.originStorage.get(ORIGIN_STORAGE_KEY) ??
			options.origin ??
			remotes.origin

		this.instance = axios.create({
			baseURL: this._origin,
			headers: {
				"Content-Type": "application/json",
			},
		})

		this.instance.interceptors.request.use(
			this.requestInterceptorFullfilled,
			this.requestInterceptorRejected,
		)

		this.instance.interceptors.response.use(
			this.responseInterceptorFullfilled,
			this.responseInterceptorRejected,
		)

		this.ws = new Realtime({
			origin: this._origin,
			eventBus: this.eventBus,
			getToken: () => session.token,
		})
	}

	// let the auth manager drive token refresh from the request pipeline
	registerAuthPlugin(plugin: ClientAuthPlugin) {
		this.authPlugin = plugin
	}

	// point the http client and the sockets to another origin, persisting it
	setOrigin(origin: string | undefined, options: { persist?: boolean } = {}) {
		const { persist = true } = options
		const next = origin ?? remotes.origin

		if (persist) {
			this.originStorage.set(ORIGIN_STORAGE_KEY, next)
		} else {
			this.originStorage.delete(ORIGIN_STORAGE_KEY)
		}

		return this.applyOrigin(next)
	}

	// clear the stored origin and fall back to the default one
	resetOrigin() {
		return this.setOrigin(undefined, { persist: false })
	}

	// override the auto detected storage driver for the persisted origin
	useStorageDriver(driver: StorageDriver) {
		this.originStorage.setDriver(driver)

		return this.restoreOrigin()
	}

	// load a persisted origin from an async driver, call on startup
	async restoreOrigin() {
		await this.originStorage.hydrate([ORIGIN_STORAGE_KEY])

		const stored = this.originStorage.get(ORIGIN_STORAGE_KEY)

		if (stored) this.applyOrigin(stored)

		return this._origin
	}

	private applyOrigin(origin: string) {
		if (origin === this._origin) return this._origin

		this._origin = origin
		this.instance.defaults.baseURL = origin
		this.ws?.setOrigin(origin)

		this.eventBus.emit("client:origin", origin)

		return origin
	}

	private requestInterceptorFullfilled = async (
		config: InternalAxiosRequestConfig,
	) => {
		if (config.skipAuth) return config

		if (this.authPlugin && session.token && !isAuthEndpoint(config.url)) {
			await this.authPlugin.ensureFreshToken?.().catch(() => {})
		}

		if (!config.headers["Authorization"] && session.token) {
			config.headers["Authorization"] = `Bearer ${session.token}`
		}

		return config
	}

	private requestInterceptorRejected = (error: any) => Promise.reject(error)

	private responseInterceptorFullfilled = (response: any) => response

	private responseInterceptorRejected = async (error: AxiosError) => {
		const config = error.config

		if (!config || config.skipAuth) return Promise.reject(error)

		const status = error.response?.status

		// on a 401 try to refresh once and replay the request
		if (
			status === 401 &&
			!config._retried &&
			!isAuthEndpoint(config.url) &&
			this.authPlugin?.onUnauthorized
		) {
			config._retried = true

			const refreshed = await this.authPlugin
				.onUnauthorized()
				.catch(() => false)

			if (refreshed) return this.instance(config)
		}

		// retry transient server errors with a small backoff
		const retries = config._retries ?? 0
		const maxRetries = config.maxRetries ?? 2

		if (status != null && status >= 500 && retries < maxRetries) {
			config._retries = retries + 1

			await delay((config.retryDelay ?? 1000) * config._retries)

			return this.instance(config)
		}

		return Promise.reject(error)
	}
}

const baseClient = new Client()

export default baseClient
