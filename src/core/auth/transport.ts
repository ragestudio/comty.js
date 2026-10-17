import type { AuthTransport } from "./types"

import client from "../client"
import UserModel from "../../endpoints/user"

export const defaultTransport: AuthTransport = {
	async login(payload) {
		const response = await client.instance.post("/auth", payload)

		return response.data
	},
	async refresh(authToken, refreshToken) {
		const response = await client.instance.post("/auth", {
			authToken,
			refreshToken,
		})

		return response.data
	},
	async fetchUser() {
		return await UserModel.data()
	},
	async logout() {
		return await client.instance.delete("/auth").catch(() => null)
	},
}

export default defaultTransport
