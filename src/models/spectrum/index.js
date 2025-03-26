import axios from "axios"
import SessionService from "../session"
//import User from "comty.js/models/user"

async function injectUserData(list) {
	if (!Array.isArray(list)) {
		return list
	}

	const user_ids = list.map((item) => {
		return item.user_id
	})

	//const users = await User.data(user_ids.join(","))

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

		if (SessionService.token) {
			baseInstance.defaults.headers.common["Authorization"] =
				`Bearer ${SessionService.token}`
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

	static async getStream({ profile_id }) {
		if (!profile_id) {
			return null
		}

		const { data } = await Streaming.base({
			method: "get",
			url: `/streaming/${profile_id}`,
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

	static async createOrUpdateStream(update) {
		const { data } = await Streaming.base({
			method: "put",
			url: `/streaming/profiles/self`,
			data: update,
		})

		return data
	}

	static async getConnectionStatus({ profile_id }) {
		console.warn("getConnectionStatus() | Not implemented")
		return false
	}

	static async getLivestreamsList({ limit, offset } = {}) {
		let { data } = await Streaming.base({
			method: "get",
			url: "/streaming/list",
			params: {
				limit,
				offset,
			},
		})

		data = await injectUserData(data)

		return data
	}

	static async getLivestreamData(livestream_id) {
		const { data } = await Streaming.base({
			method: "get",
			url: `/streaming/${livestream_id}`,
		})

		return data
	}
}
