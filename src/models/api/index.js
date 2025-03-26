import request from "../../request"

export default class API {
    /**
    * Retrieves the server keys associated with the current user.
    *
    * @return {object} The server keys data
    */
    static async getMyServerKeys() {
        const response = await request({
            method: "GET",
            url: "/server-keys/my",
        })

        return response.data
    }

    /**
     * Creates a new server key.
     *
     * @param {object} options - Options for the new server key.
     * @param {string} options.name - The name of the server key.
     * @param {string} options.description - The description of the server key.
     * @param {string} options.access - The access level of the server key.
     * @return {object} The newly created server key data.
     */
    static async createNewServerKey({
        name,
        description,
        access,
    } = {}) {
        const response = await request({
            method: "POST",
            url: "/server-keys/generate",
            data: {
                name,
                description,
                access
            }
        })

        return response.data
    }

    /**
     * Regenerates a secret token for a server key.
     *
     * @param {object} options - Options for regenerating the secret token.
     * @param {string} access_id - The ID of the server key to regenerate the secret token for.
     * @return {object} The regenerated secret token data.
     */
    static async regenerateSecretToken(access_id) {
        const response = await request({
            method: "POST",
            url: `/server-keys/${access_id}/regenerate`,
        })

        return response.data
    }

    /**
     * Deletes a server key by its access ID.
     *
     * @param {string} access_id - The ID of the server key to delete.
     * @return {Promise<object>} - A promise that resolves to the response data.
     */
    static async deleteServerKey(access_id) {
        const response = await request({
            method: "DELETE",
            url: `/server-keys/${access_id}`,
            data: {
                access_id
            }
        })

        return response.data
    }
}