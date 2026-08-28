import { Client } from "./client"

if (globalThis.isServerMode) {
	const { Buffer } = require("buffer")

	globalThis.b64Decode = (data: any) => {
		return Buffer.from(data, "base64").toString("utf-8")
	}
	globalThis.b64Encode = (data: any) => {
		return Buffer.from(data, "utf-8").toString("base64")
	}
}

export * from "./types"
export * from "./client"

export default Client
