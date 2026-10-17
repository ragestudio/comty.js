import type { EventEmitterLike, LoggerLike } from "../../types"
import type { RealtimeAction } from "./types"

import { AUTH_EVENTS } from "./constants"

export function bindAuthEvents(
	eventBus: EventEmitterLike,
	run: (action: RealtimeAction) => Promise<unknown>,
	logger: LoggerLike,
) {
	const unbinders: Array<() => void> = []

	for (const [event, action] of AUTH_EVENTS) {
		const handler = () => {
			run(action).catch((error) =>
				logger.error(`websocket action [${action}] failed`, error),
			)
		}

		eventBus.on(event, handler)
		unbinders.push(() => eventBus.off?.(event, handler))
	}

	return unbinders
}

export default bindAuthEvents
