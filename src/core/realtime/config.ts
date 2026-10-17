import Remotes from "../remotes"

import type { RealtimeOptions, ResolvedRealtimeOptions } from "./types"

export function resolveRealtimeOptions(
	options: RealtimeOptions = {},
): ResolvedRealtimeOptions {
	return {
		origin: options.origin ?? Remotes.origin,
		remotes: options.remotes ?? Remotes.websockets,
		eventBus: options.eventBus,
		getToken: options.getToken ?? (() => undefined),
		worker: options.worker ?? false,
		autoReconnect: options.autoReconnect ?? true,
		heartbeat: options.heartbeat ?? true,
		maxConnectRetries: options.maxConnectRetries ?? Infinity,
		autoManage: options.autoManage ?? true,
		logger: options.logger ?? console,
	}
}

export default resolveRealtimeOptions
