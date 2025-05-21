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
			namespace: "posts",
			path: "/posts",
			ng: true,
		},
		// {
		// 	namespace: "chats",
		// 	path: "/chats",
		// },
	],
}
