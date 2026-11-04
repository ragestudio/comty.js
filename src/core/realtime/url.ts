export function resolveWebsocketUrl(origin: string, path: string) {
	const base = origin.endsWith("/") ? origin : `${origin}/`
	const url = new URL(path.replace(/^\/+/, ""), base)

	url.protocol = url.protocol === "https:" ? "wss:" : "ws:"

	return url.toString()
}

export default resolveWebsocketUrl
