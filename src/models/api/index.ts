import BaseModel from "../../classes/BaseModel"
import { Definition } from "../../decorators/Definition"

class APIModel extends BaseModel {
	/**
	 * Retrieves the server keys associated with the current user.
	 */
	@Definition(() => ({
		method: "GET",
		url: "/server-keys/my",
	}))
	getMyServerKeys: () => Promise<Record<string, any>>

	/**
	 * Creates a new server key.
	 */
	@Definition(({ name, description, access }) => ({
		method: "POST",
		url: "/server-keys/generate",
		data: { name, description, access },
	}))
	createNewServerKey: (payload: {
		name: string
		description?: string
		access: string
	}) => Promise<Record<string, any>>

	/**
	 * Regenerates a secret token for a server key.
	 */
	@Definition((access_id) => ({
		method: "POST",
		url: `/server-keys/${access_id}/regenerate`,
	}))
	regenerateSecretToken: (access_id: string) => Promise<Record<string, any>>

	/**
	 * Deletes a server key by its access ID.
	 */
	@Definition((access_id) => ({
		method: "DELETE",
		url: `/server-keys/${access_id}`,
		data: { access_id },
	}))
	deleteServerKey: (access_id: string) => Promise<Record<string, any>>
}

export default new APIModel()
