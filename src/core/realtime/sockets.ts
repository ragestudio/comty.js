import { WebsocketClient } from "@linebridge/client"

import type { WebsocketRemote } from "../remotes"
import type { ResolvedRealtimeOptions } from "./types"

import { FORWARDED_EVENTS } from "./constants"
import { resolveWebsocketUrl } from "./url"

export function createSocket(
	remote: WebsocketRemote,
	options: ResolvedRealtimeOptions,
	origin: string,
	onEvent: (event: string, data: any) => void,
) {
	const socket = new WebsocketClient({
		refName: remote.namespace,
		url: resolveWebsocketUrl(origin, remote.path),
		token: () => options.getToken(),
		worker: options.worker,
		autoReconnect: options.autoReconnect,
		heartbeat: options.heartbeat,
		maxConnectRetries: options.maxConnectRetries,
	})

	for (const event of FORWARDED_EVENTS) {
		socket.on(event, (data: any) => onEvent(event, data))
	}

	return socket
}

export default createSocket
