import axios from "axios"
import request from "../../request"

import { RTEngineClient } from "linebridge-client"

import SessionModel from "../session"
import UserModel from "../user"

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
	static get baseUrl() {
		if (process.env.NODE_ENV === "production") {
			return "https://live.ragestudio.net"
		}

		return __comty_shared_state.baseRequest.defaults.baseURL + "/spectrum"
	}

	static async getStream(stream_id) {
		if (!stream_id) {
			return null
		}

		const { data } = await request({
			baseURL: Streaming.baseUrl,
			method: "get",
			url: `/stream/${stream_id}/data`,
		})

		return data
	}

	static async getOwnProfiles() {
		const { data } = await request({
			baseURL: Streaming.baseUrl,
			method: "GET",
			url: "/streaming/profiles/self",
		})

		return data
	}

	static async getProfile(profile_id) {
		if (!profile_id) {
			return null
		}

		const { data } = await request({
			baseURL: Streaming.baseUrl,
			method: "GET",
			url: `/streaming/profiles/${profile_id}`,
		})

		return data
	}

	static async createProfile(payload) {
		const { data } = await request({
			baseURL: Streaming.baseUrl,
			method: "POST",
			url: "/streaming/profiles/new",
			data: payload,
		})

		return data
	}

	static async updateProfile(profile_id, update) {
		if (!profile_id) {
			return null
		}

		const { data } = await request({
			baseURL: Streaming.baseUrl,
			method: "PUT",
			url: `/streaming/profiles/${profile_id}`,
			data: update,
		})

		return data
	}

	static async deleteProfile(profile_id) {
		if (!profile_id) {
			return null
		}

		const { data } = await request({
			baseURL: Streaming.baseUrl,
			method: "delete",
			url: `/streaming/profiles/${profile_id}`,
		})

		return data
	}

	static async addRestreamToProfile(profileId, restreamData) {
		if (!profileId) {
			console.error("profileId is required to add a restream")
			return null
		}

		const { data } = await request({
			baseURL: Streaming.baseUrl,
			method: "put",
			url: `/streaming/profiles/${profileId}/restreams`,
			data: restreamData,
		})

		return data
	}

	static async deleteRestreamFromProfile(profileId, restreamIndexData) {
		if (!profileId) {
			console.error("profileId is required to delete a restream")
			return null
		}

		const { data } = await request({
			baseURL: Streaming.baseUrl,
			method: "delete",
			url: `/streaming/profiles/${profileId}/restreams`,
			data: restreamIndexData,
		})

		return data
	}

	static async list({ limit, offset } = {}) {
		let { data } = await request({
			baseURL: Streaming.baseUrl,
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

	static createWebsocket(params = {}) {
		const client = new RTEngineClient({
			...params,
			url: Streaming.baseUrl,
			token: SessionModel.token,
		})

		return client
	}

	static async createStreamWebsocket(stream_id, params = {}) {
		if (!stream_id) {
			console.error("stream_id is required")
			return null
		}

		const client = Streaming.createWebsocket(params)

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
