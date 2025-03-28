import pkg from "../package.json"
import EventEmitter from "@foxify/events"
import axios from "axios"

import AddonsManager from "./addons"
import WebsocketManager from "./ws"
import Storage from "./helpers/withStorage"
import Remotes from "./remotes"

globalThis.isServerMode =
	typeof window === "undefined" && typeof global !== "undefined"

if (globalThis.isServerMode) {
	const { Buffer } = require("buffer")

	globalThis.b64Decode = (data) => {
		return Buffer.from(data, "base64").toString("utf-8")
	}
	globalThis.b64Encode = (data) => {
		return Buffer.from(data, "utf-8").toString("base64")
	}
}

/**
 * Create a client with the specified access key, private key, and websocket enablement.
 *
 * @param {Object} options - Optional parameters for accessKey, privateKey, and enableWs
 * @return {Object} sharedState - Object containing eventBus, mainOrigin, baseRequest, sockets, rest, and version
 */
export function createClient({
	accessKey = null,
	privateKey = null,
	ws = {
		enable: false,
		autoConnect: false,
	},
	origin = Remotes.origin,
	eventBus = new EventEmitter(),
} = {}) {
	const sharedState = (globalThis.__comty_shared_state = {
		eventBus: eventBus,
		mainOrigin: origin,
		baseRequest: null,
		ws: null,
		rest: null,
		version: pkg.version,
		addons: new AddonsManager(),
	})

	if (privateKey && accessKey && globalThis.isServerMode) {
		Storage.engine.set("token", `${accessKey}:${privateKey}`)
	}

	sharedState.baseRequest = axios.create({
		baseURL: origin,
		headers: {
			"Content-Type": "application/json",
		},
	})

	// create a interceptor to attach the token every request
	sharedState.baseRequest.interceptors.request.use((config) => {
		// check if current request has no Authorization header, if so, attach the token
		if (!config.headers["Authorization"]) {
			const sessionToken = Storage.engine.get("token")

			if (sessionToken) {
				config.headers["Authorization"] =
					`${globalThis.isServerMode ? "Server" : "Bearer"} ${sessionToken}`
			} else {
				console.warn("Making a request with no session token")
			}
		}

		return config
	})

	if (typeof ws === "object") {
		if (ws.enable === true) {
			__comty_shared_state.ws = new WebsocketManager({
				origin: origin,
			})

			if (ws.autoConnect === true) {
				sharedState.ws.connectAll()
			}
		}
	}

	return sharedState
}

export default createClient
