import request from "../../request"
import SessionModel from "../session"

export default class ChatsService {
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

    static async getRecentChats() {
        const { data } = await request({
            method: "GET",
            url: "/chats/my",
        })

        return data
    }
}