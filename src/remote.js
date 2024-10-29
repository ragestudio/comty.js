const envOrigins = {
    "development": `${location.origin}/api`,
    "indev": "https://indev.comty.app/api",
    "production": "https://api.comty.app",
}

export default {
    origin: envOrigins[process.env.NODE_ENV ?? "production"],
    websockets: [
        {
            namespace: "posts",
            path: "/posts",
        },
        {
            namespace: "main",
            path: "/main",
        },
        {
            namespace: "notifications",
            path: "/notifications",
        },
        {
            namespace: "chats",
            path: "/chats",
        },
        {
            namespace: "music",
            path: "/music",
        }
        // {
        //     namespace: "payments",
        //     path: "/payments",
        // }
    ]
}