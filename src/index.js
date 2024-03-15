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
            console.debug(`[WS-API][${key}] Connected`)

            globalThis.__comty_shared_state.eventBus.emit(`${key}:connected`)
        })

        instance.on("disconnect", () => {
            console.debug(`[WS-API][${key}] Disconnected`)

            globalThis.__comty_shared_state.eventBus.emit(`${key}:disconnected`)
        })

        instance.on("error", (error) => {
            console.error(`[WS-API][${key}] Error`, error)

            globalThis.__comty_shared_state.eventBus.emit(`${key}:error`, error)
        })

        instance.onAny((event, ...args) => {
            console.debug(`[WS-API][${key}] Event (${event})`, ...args)

            globalThis.__comty_shared_state.eventBus.emit(`${key}:${event}`, ...args)
        })
    }
}

export async function disconnectWebsockets() {
    const instances = globalThis.__comty_shared_state.sockets

    for (let [key, instance] of Object.entries(instances)) {
        if (instance.connected) {
            instance.disconnect()
        }
    }
}

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

export function createClient({
    accessKey = null,
    privateKey = null,
    enableWs = false,
} = {}) {
    const sharedState = globalThis.__comty_shared_state = {
        onExpiredExceptionEvent: false,
        excludedExpiredExceptionURL: ["/session/regenerate"],
        eventBus: new EventEmitter(),
        mainOrigin: remote.origin,
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
        baseURL: remote.origin,
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