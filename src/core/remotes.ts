export type WebsocketRemote = {
	namespace: string
	path: string
}

export type Remotes = {
	origin: string
	websockets: WebsocketRemote[]
}

const DEFAULT_ORIGIN = "https://api.comty.app"
const DEVELOPMENT_ORIGIN = "https://indev.comty.app/api"

const envOrigins: Record<string, string | undefined> = {
	development: DEVELOPMENT_ORIGIN,
	indev: DEVELOPMENT_ORIGIN,
	production: DEFAULT_ORIGIN,
}

// react native defines __DEV__ from the bundle build type (debug or release),
// so native builds do not depend on how NODE_ENV was inlined by the bundler
declare const __DEV__: boolean | undefined

function resolveOrigin(): string {
	if (typeof __DEV__ === "boolean") {
		return __DEV__ ? DEVELOPMENT_ORIGIN : DEFAULT_ORIGIN
	}

	return envOrigins[process.env.NODE_ENV ?? "production"] ?? DEFAULT_ORIGIN
}

const remotes: Remotes = {
	origin: resolveOrigin(),
	websockets: [
		{
			namespace: "main",
			path: "/ws",
		},
	],
}

export default remotes
