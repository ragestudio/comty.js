import BaseModel from "../../classes/BaseModel"
import { Definition } from "../../decorators/Definition"

export class E2EModel extends BaseModel {
	/**
	 * Fetches the user key pair from the server.
	 */
	@Definition(() => ({
		method: "GET",
		url: "/users/self/keypair",
	}))
	getKeyPair: () => Promise<object>

	/**
	 * Updates the user key pair on the server.
	 * WARNING: updating keypair makes all decryption fail
	 */
	@Definition((str, { imSure = false } = {}) => {
		if (imSure !== true) {
			throw new Error(
				"Missing confirmation to update the keypair. Use `imSure = true` to proceed.",
			)
		}

		return {
			method: "POST",
			url: "/users/self/keypair",
			data: { str: str },
		}
	})
	updateKeyPair_: (str: string, opts?: { imSure?: boolean }) => Promise<object>
}

export default new E2EModel()
