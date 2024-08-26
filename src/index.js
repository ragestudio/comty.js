import pkg from "../package.json"
import EventEmitter from "@foxify/events"

import axios from "axios"
import { io } from "socket.io-client"

import { createHandlers } from "./models"
import Storage from "./helpers/withStorage"
import remote from "./remote"

globalThis.isServerMode = typeof window === "undefined" && typeof global !== "undefined"

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
 * Creates websockets by disconnecting and removing listeners from existing instances,
 * then creating new instances for each websocket in the remote.websockets array.
 * Registers event listeners for connection, disconnection, reconnection, error, and any other events.
 *
 * @return {Promise<void>} A promise that resolves when all websockets have been created and event listeners have been registered.
 */
export async function createWebsockets() {
    if (!remote.websockets) {
        return false
    }

    const instances = globalThis.__comty_shared_state.sockets

    for (let [key, instance] of Object.entries(instances)) {
        if (instance.connected) {
            // disconnect first
            instance.disconnect()
        }

        // remove current listeners
        instance.removeAllListeners()

        delete globalThis.__comty_shared_state.sockets[key]
    }

    for (let ws of remote.websockets) {
        let opts = {
            transports: ["websocket"],
            autoConnect: ws.autoConnect ?? true,
            forceNew: true,
            path: ws.path,
            ...ws.params ?? {},
        }

        if (ws.noAuth !== true) {
            opts.auth = {
                token: Storage.engine.get("token"),
            }
        }

        globalThis.__comty_shared_state.sockets[ws.namespace] = io(remote.origin, opts)
    }

    // regsister events
    for (let [key, instance] of Object.entries(instances)) {
        instance.on("connect", () => {
            //console.debug(`[WS-API][${key}] Connected`)

            globalThis.__comty_shared_state.eventBus.emit(`${key}:connected`)
        })

        instance.on("disconnect", () => {
            //console.debug(`[WS-API][${key}] Disconnected`)

            globalThis.__comty_shared_state.eventBus.emit(`${key}:disconnected`)
        })

        instance.on("reconnect", () => {
            // console.debug(`[WS-API][${key}] Reconnected`)

            globalThis.__comty_shared_state.eventBus.emit(`${key}:reconnected`)

            reauthenticateWebsockets()
        })

        instance.on("error", (error) => {
            //console.error(`[WS-API][${key}] Error`, error)

            globalThis.__comty_shared_state.eventBus.emit(`${key}:error`, error)
        })

        instance.onAny((event, ...args) => {
            //console.debug(`[WS-API][${key}] Event (${event})`, ...args)

            globalThis.__comty_shared_state.eventBus.emit(`${key}:${event}`, ...args)
        })
    }
}

/**
 * Disconnects all websocket instances by calling the `disconnect` method on each instance.
 *
 * @return {Promise<void>} A promise that resolves when all websocket instances have been disconnected.
 */
export async function disconnectWebsockets() {
    const instances = globalThis.__comty_shared_state.sockets

    for (let [key, instance] of Object.entries(instances)) {
        if (instance.connected) {
            instance.disconnect()
        }
    }
}

/**
 * Reconnects all websocket instances by disconnecting and reconnecting them with the current token.
 *
 * @return {Promise<void>} A promise that resolves when all websocket instances have been reconnected.
 */
export async function reconnectWebsockets() {
    const instances = globalThis.__comty_shared_state.sockets

    for (let [key, instance] of Object.entries(instances)) {
        if (instance.connected) {
            // disconnect first
            instance.disconnect()
        }

        instance.auth = {
            token: Storage.engine.get("token"),
        }

        instance.connect()
    }
}

/**
 * Reauthenticates all websocket instances with the current token. If a websocket instance is not connected, it connects to the server. If it is connected, it emits an "auth:reauth" event with the current token.
 *
 * @return {Promise<void>} Promise that resolves when all websocket instances have been reauthenticated.
 */
export async function reauthenticateWebsockets() {
    const instances = globalThis.__comty_shared_state.sockets

    for (let [key, instance] of Object.entries(instances)) {
        const token = Storage.engine.get("token")

        instance.auth = {
            token: token,
        }

        if (!instance.connected) {
            instance.connect()
        } else {
            instance.emit("auth:reauth", token)
        }
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
    enableWs = false,
    origin = remote.origin,
} = {}) {
    const sharedState = globalThis.__comty_shared_state = {
        eventBus: new EventEmitter(),
        mainOrigin: origin,
        baseRequest: null,
        sockets: new Map(),
        rest: null,
        version: pkg.version,
    }

    sharedState.rest = createHandlers()

    if (privateKey && accessKey && globalThis.isServerMode) {
        Storage.engine.set("token", `${accessKey}:${privateKey}`)
    }

    sharedState.baseRequest = axios.create({
        baseURL: origin,
        headers: {
            "Content-Type": "application/json",
        }
    })

    // create a interceptor to attach the token every request
    sharedState.baseRequest.interceptors.request.use((config) => {
        // check if current request has no Authorization header, if so, attach the token
        if (!config.headers["Authorization"]) {
            const sessionToken = Storage.engine.get("token")

            if (sessionToken) {
                config.headers["Authorization"] = `${globalThis.isServerMode ? "Server" : "Bearer"} ${sessionToken}`
            } else {
                console.warn("Making a request with no session token")
            }
        }

        return config
    })

    if (enableWs) {
        createWebsockets()
    }

    return sharedState
}

export default createClient