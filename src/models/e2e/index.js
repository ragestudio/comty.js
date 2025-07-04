import SessionModel from "../session"
import request from "../../request"

export default class E2EModel {
	static async getKeyPair() {
		const response = await request({
			method: "GET",
			url: "/users/self/keypair",
		})

		return response.data
	}

	// WARNING: updating keypair makes all decryption fail
	static async updateKeyPair(str, { imSure = false } = {}) {
		if (imSure !== true) {
			throw new Error(
				"Missing confirmation to update the keypair. Use `imSure = true` to proceed.",
			)
		}

		const response = await request({
			method: "POST",
			url: "/users/self/keypair",
			data: { str: str },
		})

		return response.data
	}
}
