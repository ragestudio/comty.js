function getCurrentHostname() {
    if (typeof window === "undefined") {
        return "localhost"
    }

    return window?.location?.hostname ?? "localhost"
}

const envOrigins = {
    "development": `http://${getCurrentHostname()}:9000`,
    "indev": "https://indev_api.comty.app",
    "production": "https://api.comty.app",
}

export default {
    default: {
        origin: envOrigins[process.env.NODE_ENV ?? "production"],
        hasWebsocket: false,
    }
}