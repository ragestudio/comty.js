import axios from "axios"
import SessionModel from "../session"
import UserModel from "../user"
import { RTEngineClient } from "linebridge-client/src"
//import { RTEngineClient } from "../../../../linebridge/client/src"

async function injectUserDataOnList(list) {
	if (!Array.isArray(list)) {
		return list
	}

	const user_ids = list.map((item) => {
		return item.user_id
	})

	let users = await UserModel.data({
		user_id: user_ids.join(","),
		basic: true,
	})

	if (!Array.isArray(users)) {
		users = [users]
	}

	const userMap = new Map(users.map((user) => [user._id, user]))

	list = list.map((item) => {
		const user = userMap.get(item.user_id)
		return {
			...item,
			user: user,
		}
	})

	return list
}

export default class Streaming {
	static apiHostname = "https://live.ragestudio.net"

	static get base() {
		const baseInstance = axios.create({
			baseURL: Streaming.apiHostname,
			headers: {
				Accept: "application/json",
				"ngrok-skip-browser-warning": "any",
			},
		})

		if (SessionModel.token) {
			baseInstance.defaults.headers.common["Authorization"] =
				`Bearer ${SessionModel.token}`
		}

		return baseInstance
	}

	static async serverInfo() {
		const { data } = await Streaming.base({
			method: "get",
		})

		return {
			...data,
			hostname: Streaming.apiHostname,
		}
	}

	static async getStream(stream_id) {
		if (!stream_id) {
			return null
		}

		const { data } = await Streaming.base({
			method: "get",
			url: `/streaming/${stream_id}`,
		})

		return data
	}

	static async getOwnProfiles() {
		const { data } = await Streaming.base({
			method: "get",
			url: "/streaming/profiles/self",
		})

		return data
	}

	static async getProfile({ profile_id }) {
		if (!profile_id) {
			return null
		}

		const { data } = await Streaming.base({
			method: "get",
			url: `/streaming/profiles/${profile_id}`,
		})

		return data
	}

	static async createOrUpdateProfile(update) {
		const { data } = await Streaming.base({
			method: "put",
			url: `/streaming/profiles/self`,
			data: update,
		})

		return data
	}

	static async deleteProfile({ profile_id }) {
		if (!profile_id) {
			return null
		}

		const { data } = await Streaming.base({
			method: "delete",
			url: `/streaming/profiles/${profile_id}`,
		})

		return data
	}

	static async list({ limit, offset } = {}) {
		let { data } = await Streaming.base({
			method: "get",
			url: "/streaming/list",
			params: {
				limit,
				offset,
			},
		})

		data = await injectUserDataOnList(data)

		return data
	}

	static async createStreamWebsocket(stream_id, params = {}) {
		if (!stream_id) {
			console.error("stream_id is required")
			return null
		}

		const client = new RTEngineClient({
			...params,
			url: Streaming.apiHostname,
			token: SessionModel.token,
		})

		client._destroy = client.destroy

		client.destroy = () => {
			client.emit("stream:leave", stream_id)

			if (typeof client._destroy === "function") {
				client._destroy()
			}
		}

		client.requestState = async () => {
			return await client.call("stream:state", stream_id)
		}

		client.on("connected", () => {
			client.emit("stream:join", stream_id)
		})

		return client
	}
}
