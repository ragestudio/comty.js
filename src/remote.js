function getCurrentHostname() {
    if (typeof window === "undefined") {
        return "localhost"
    }

    return window?.location?.hostname ?? "localhost"
}

function getCurrentProtocol() {
    if (typeof window === "undefined") {
        return "http"
    }

    return window?.location?.protocol ?? "http:"
}

const envOrigins = {
    "development": `${getCurrentProtocol()}//${getCurrentHostname()}:9000`,
    "indev": "https://indev_api.comty.app",
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
        }
    ]
}