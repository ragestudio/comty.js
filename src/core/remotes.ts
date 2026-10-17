export type WebsocketRemote = {
	namespace: string
	path: string
}

export type Remotes = {
	origin: string
	websockets: WebsocketRemote[]
}

const DEFAULT_ORIGIN = "https://api.comty.app"

const envOrigins: Record<string, string | undefined> = {
	development: "https://indev.comty.app/api",
	indev: "https://indev.comty.app/api",
	production: DEFAULT_ORIGIN,
}

const remotes: Remotes = {
	origin: envOrigins[process.env.NODE_ENV ?? "production"] ?? DEFAULT_ORIGIN,
	websockets: [
		{
			namespace: "main",
			path: "/ws",
		},
	],
}

export default remotes
