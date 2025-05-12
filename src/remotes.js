const envOrigins = {
	development: globalThis.isServerMode
		? "http://localhost:9000"
		: `${location.origin}/api`,
	indev: "https://indev.comty.app/api",
	production: "https://api.comty.app",
}

export default {
	origin: envOrigins[process.env.NODE_ENV ?? "production"],
	websockets: [
		{
			namespace: "posts",
			path: "/posts",
			ng: true,
		},
		{
			namespace: "notifications",
			path: "/notifications",
		},
		{
			namespace: "chats",
			path: "/chats",
		},
	],
}
