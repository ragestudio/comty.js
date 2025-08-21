const envOrigins = {
	development: globalThis.isServerMode
		? "http://localhost:9000"
		: `${globalThis.location?.origin}/api`,
	indev: "https://indev.comty.app/api",
	production: "https://api.comty.app",
}

export default {
	origin: envOrigins[process.env.NODE_ENV ?? "production"],
	websockets: [
		{
			namespace: "main",
			path: "/main",
		},
		{
			namespace: "posts",
			path: "/posts",
		},
		{
			namespace: "chats",
			path: "/chats",
		},
	],
}
