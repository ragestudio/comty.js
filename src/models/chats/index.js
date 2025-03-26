import request from "../../request"

export default class ChatsService {
    /**
     * Retrieves the chat history for a given chat ID.
     *
     * @param {string} chat_id - The ID of the chat.
     * @return {Promise<Object>} The chat history data.
     * @throws {Error} If the chat_id is not provided.
     */
    static async getChatHistory(chat_id) {
        if (!chat_id) {
            throw new Error("chat_id is required")
        }

        const { data } = await request({
            method: "GET",
            url: `/chats/${chat_id}/history`,
        })

        return data
    }

    /**
     * Retrieves the recent chats for the current user.
     *
     * @return {Promise<Object>} The chat history data.
     */
    static async getRecentChats() {
        const { data } = await request({
            method: "GET",
            url: "/chats/my",
        })

        return data
    }
}