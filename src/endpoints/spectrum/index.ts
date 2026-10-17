import { WebsocketClient } from "@linebridge/client"
import BaseEndpoint from "../../core/endpoint/BaseEndpoint"
import client from "../../core/client"

import * as v from "valibot"
import { Definition } from "../../core/endpoint/decorators/Definition"
import { Validate } from "../../core/endpoint/decorators/Validate"

import SessionModel from "../session"
import UserModel from "../user"
import session from "../../core/session"

async function injectUserDataOnList(list: any[]) {
	if (!Array.isArray(list)) return list

	const user_ids = list.map((item) => item.user_id)
	let users = await UserModel.data({
		user_id: user_ids.join(","),
		basic: true,
	})
	if (!Array.isArray(users)) users = [users]

	const userMap = new Map(users.map((user: any) => [user._id, user]))

	return list.map((item) => ({
		...item,
		user: userMap.get(item.user_id),
	}))
}

export class SpectrumModel extends BaseEndpoint {
	get baseUrl() {
		if (process.env.NODE_ENV === "production") {
			return "https://live.ragestudio.net"
		}
		return client.instance.defaults.baseURL + "/spectrum"
	}

	@Validate(v.pipe(v.string(), v.minLength(1)))
	@Definition(function (this: SpectrumModel, stream_id) {
		return {
			baseURL: this.baseUrl,
			method: "GET",
			url: `/stream/${stream_id}`,
		}
	})
	getStream!: (stream_id: string) => Promise<any>

	@Definition(function (this: SpectrumModel) {
		return {
			baseURL: this.baseUrl,
			method: "GET",
			url: "/profiles/self",
		}
	})
	getOwnProfiles!: () => Promise<any>

	@Validate(v.pipe(v.string(), v.minLength(1)))
	@Definition(function (this: SpectrumModel, profile_id) {
		return {
			baseURL: this.baseUrl,
			method: "GET",
			url: `/stream/${profile_id}`,
		}
	})
	getProfile!: (profile_id: string) => Promise<any>

	@Definition(function (this: SpectrumModel, payload) {
		return {
			baseURL: this.baseUrl,
			method: "POST",
			url: "/profiles/new",
			data: payload,
		}
	})
	createProfile!: (payload: any) => Promise<any>

	@Validate(v.pipe(v.string(), v.minLength(1)))
	@Definition(function (this: SpectrumModel, profile_id, update) {
		return {
			baseURL: this.baseUrl,
			method: "PUT",
			url: `/profiles/${profile_id}`,
			data: update,
		}
	})
	updateProfile!: (profile_id: string, update: any) => Promise<any>

	@Validate(v.pipe(v.string(), v.minLength(1)))
	@Definition(function (this: SpectrumModel, profile_id) {
		return {
			baseURL: this.baseUrl,
			method: "DELETE",
			url: `/profiles/${profile_id}`,
		}
	})
	deleteProfile!: (profile_id: string) => Promise<any>

	@Validate(v.pipe(v.string(), v.minLength(1)))
	@Definition(function (this: SpectrumModel, profileId, restreamData) {
		return {
			baseURL: this.baseUrl,
			method: "PUT",
			url: `/profiles/${profileId}/restreams`,
			data: restreamData,
		}
	})
	addRestreamToProfile!: (profileId: string, restreamData: any) => Promise<any>

	@Validate(v.pipe(v.string(), v.minLength(1)))
	@Definition(function (this: SpectrumModel, profileId, restreamIndexData) {
		return {
			baseURL: this.baseUrl,
			method: "DELETE",
			url: `/profiles/${profileId}/restreams`,
			data: restreamIndexData,
		}
	})
	deleteRestreamFromProfile!: (
		profileId: string,
		restreamIndexData: any,
	) => Promise<any>

	async list({ limit, offset }: any = {}) {
		const { data } = await this.request({
			baseURL: this.baseUrl,
			method: "GET",
			url: "/streams/list",
			params: { limit, offset },
		})
		return await injectUserDataOnList(data)
	}

	createWebsocket(params: any = {}) {
		return new WebsocketClient({
			...params,
			url: this.baseUrl,
			token: session.token,
			worker: false,
		})
	}

	async createStreamWebsocket(stream_id: string, params: any = {}) {
		if (!stream_id) {
			console.error("stream_id is required")
			return null
		}

		const client = this.createWebsocket(params)
		const _destroy = client.destroy.bind(client)

		client.destroy = () => {
			client.emit("stream:leave", stream_id)
			if (typeof _destroy === "function") _destroy()
		}

		// @ts-ignore
		client.requestState = async () => {
			return await client.call("stream:state", stream_id)
		}

		client.on("connected", () => {
			client.emit("stream:join", stream_id)
		})

		return client
	}
}

export default new SpectrumModel()
