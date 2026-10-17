import type { AuthManagerOptions, AuthTransport } from "./types"
import type { EventEmitterLike, LoggerLike } from "../../types"

import client from "../client"
import { defaultTransport } from "./transport"

export const DEFAULT_AUTH_OPTIONS: Required<
	Omit<AuthManagerOptions, "transport" | "eventBus" | "logger">
> = {
	autoRefresh: true,
	refreshThreshold: 120,
	minRefreshDelay: 30_000,
	maxRefreshDelay: 5 * 60_000,
	retryDelay: 1000,
	maxRetries: 3,
}

export type ResolvedAuthOptions = typeof DEFAULT_AUTH_OPTIONS & {
	transport: AuthTransport
	eventBus: EventEmitterLike
	logger: LoggerLike
}

export function resolveAuthOptions(
	options: AuthManagerOptions = {},
): ResolvedAuthOptions {
	const { transport, eventBus, logger, ...rest } = options

	return {
		...DEFAULT_AUTH_OPTIONS,
		...rest,
		transport: { ...defaultTransport, ...transport },
		eventBus: eventBus ?? client.eventBus,
		logger: logger ?? console,
	}
}

export default resolveAuthOptions
