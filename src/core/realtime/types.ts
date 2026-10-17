import type { EventEmitterLike, LoggerLike } from "../../types"
import type { WebsocketRemote } from "../remotes"

export type RealtimeAction = "connect" | "reauthenticate" | "disconnect"

export type RealtimeOptions = {
	origin?: string
	remotes?: WebsocketRemote[]
	eventBus?: EventEmitterLike
	getToken?: () => string | undefined | Promise<string | undefined>
	worker?: boolean
	autoReconnect?: boolean
	heartbeat?: boolean
	maxConnectRetries?: number
	autoManage?: boolean
	logger?: LoggerLike
}

export type ResolvedRealtimeOptions = {
	origin: string
	remotes: WebsocketRemote[]
	eventBus?: EventEmitterLike
	getToken: () => string | undefined | Promise<string | undefined>
	worker: boolean
	autoReconnect: boolean
	heartbeat: boolean
	maxConnectRetries: number
	autoManage: boolean
	logger: LoggerLike
}
