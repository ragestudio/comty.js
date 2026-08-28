const envOrigins = {
	// development: globalThis.isServerMode
	// 	? "http://localhost:9000"
	// 	: `${globalThis.location?.origin}/api`,
	//development: "http://127.0.0.1:9000",
	development: "https://indev.comty.app/api",
	indev: "https://indev.comty.app/api",
	production: "https://api.comty.app",
}

export default {
	origin: envOrigins[process.env.NODE_ENV ?? "production"],
	websockets: [
		{
			namespace: "main",
			path: "/ws",
		},
	],
}
