import request from "../../request"

export default class NFCModel {
    /**
     * Retrieves the list of tags owned by the current user.
     *
     * @return {Promise<Object>} A promise that resolves with the data of the tags.
     */
    static async getOwnTags() {
        const { data } = await request({
            method: "GET",
            url: `/nfc/tag/my`
        })

        return data
    }

    /**
     * Retrieves a tag by its ID.
     *
     * @param {type} id - The ID of the tag to retrieve.
     * @return {type} The data of the retrieved tag.
     */
    static async getTagById(id) {
        if (!id) {
            throw new Error("ID is required")
        }

        const { data } = await request({
            method: "GET",
            url: `/nfc/tag/id/${id}`
        })

        return data
    }

    /**
     * Retrieves a tag by its serial number.
     *
     * @param {string} serial - The serial number of the tag to retrieve.
     * @throws {Error} If the serial number is not provided.
     * @return {Promise<Object>} A promise that resolves with the data of the tag.
     */
    static async getTagBySerial(serial) {
        if (!serial) {
            throw new Error("Serial is required")
        }

        const { data } = await request({
            method: "GET",
            url: `/nfc/tag/serial/${serial}`
        })

        return data
    }

    /**
     * Registers a tag with the given serial number and payload.
     *
     * @param {string} serial - The serial number of the tag.
     * @param {Object} payload - The payload data for the tag.
     * @throws {Error} If the serial or payload is not provided.
     * @return {Promise<Object>} The data of the registered tag.
     */
    static async registerTag(serial, payload) {
        if (!serial) {
            throw new Error("Serial is required")
        }

        if (!payload) {
            throw new Error("Payload is required")
        }

        if (window) {
            payload.origin = window.location.host
        }

        const { data } = await request({
            method: "POST",
            url: `/nfc/tag/register/${serial}`,
            data: payload,
        })

        return data
    }

    static async deleteTag(id) {
        if (!id) {
            throw new Error("ID is required")
        }

        const { data } = await request({
            method: "DELETE",
            url: `/nfc/tag/id/${id}`
        })

        return data
    }
}