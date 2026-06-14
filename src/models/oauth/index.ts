import request from "../../request"

export type CreateAppPayload = {
	client_name: string
	redirect_uris: string[]
}

export type AuthorizePayload = {
	action: string
	client_id: string
	scope: string
	redirect_uri: string
	response_type: string
	state?: string
}

export default class OAuth {
	static async getMyApps() {
		const response = await request({
			method: "GET",
			url: "/oauth/apps",
		})

		return response.data
	}

	static async createApp(payload: CreateAppPayload) {
		if (typeof payload.client_name !== "string") {
			throw new Error("name must be a string")
		}

		if (!Array.isArray(payload.redirect_uris)) {
			throw new Error("redirect_uris must be an array")
		}

		const response = await request({
			method: "POST",
			url: "/oauth/apps",
			data: payload,
		})

		return response.data
	}

	static async deleteApp(clientId: string) {
		if (typeof clientId !== "string") {
			throw new Error("clientId must be a string")
		}

		const response = await request({
			method: "DELETE",
			url: `/oauth/apps/${clientId}`,
		})

		return response.data
	}

	static async regenerateSecret(clientId: string) {
		if (typeof clientId !== "string") {
			throw new Error("clientId must be a string")
		}

		const response = await request({
			method: "POST",
			url: `/oauth/apps/${clientId}/regenerate-secret`,
		})

		return response.data
	}

	static async authorize(payload: AuthorizePayload) {
		const query = new URLSearchParams(payload).toString()

		const response = await request({
			method: "POST",
			url: `/oauth/authorize?${query}`,
			data: payload,
		})

		return response.data
	}
}
