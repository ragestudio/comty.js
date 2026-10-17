import type { WebsocketClient } from "@linebridge/client"

import client from "../core/client"

export type PingTarget = "http" | "ws"
export type PingResult = number | "timeout" | "failed" | "unavailable"

const fetchers: Record<PingTarget, () => Promise<PingResult>> = {
	http: () =>
		new Promise<PingResult>((resolve) => {
			const start = Date.now()

			const failTimeout = setTimeout(() => resolve("timeout"), 5000)

			client
				.instance({
					method: "GET",
					url: "/ping",
				})
				.then(() => {
					clearTimeout(failTimeout)
					resolve(Date.now() - start)
				})
				.catch((error) => {
					console.error(error)
					clearTimeout(failTimeout)
					resolve("failed")
				})
		}),
	ws: () =>
		new Promise<PingResult>((resolve) => {
			const start = Date.now()

			const failTimeout = setTimeout(() => resolve("failed"), 5000)

			const sockets = client.ws.sockets

			if (!sockets || sockets.size === 0) {
				clearTimeout(failTimeout)
				resolve("unavailable")
				return
			}

			const firstSocket = sockets.values().next().value as
				| WebsocketClient
				| undefined

			if (!firstSocket) {
				clearTimeout(failTimeout)
				resolve("unavailable")
				return
			}

			firstSocket.once("pong", () => {
				clearTimeout(failTimeout)
				resolve(Date.now() - start)
			})

			firstSocket.emit("ping")
		}),
}

export default async function measurePing(
	{ select }: { select?: PingTarget[] } = { select: [] },
): Promise<PingResult[]> {
	let selectedPromises: Array<Promise<PingResult>> = []

	if (Array.isArray(select)) {
		select.forEach((item) => {
			const fetcher = fetchers[item]

			if (!fetcher) return

			selectedPromises.push(fetcher())
		})
	} else {
		selectedPromises = [fetchers.http(), fetchers.ws()]
	}

	return await Promise.all(selectedPromises)
}
