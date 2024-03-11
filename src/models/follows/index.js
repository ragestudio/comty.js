import { SessionModel } from "../../models"
import request from "../../handlers/request"

export default class FollowsModel {
    static imFollowing = async (user_id) => {
        if (!user_id) {
            throw new Error("user_id is required")
        }

        const response = await request({
            method: "GET",
            url: `/users/${user_id}/following`,
        })

        return response.data
    }

    static getFollowers = async (user_id, fetchData) => {
        if (!user_id) {
            // set current user_id
            user_id = SessionModel.user_id
        }

        const response = await request({
            method: "GET",
            url: `/users/${user_id}/followers`,
            params: {
                fetchData: fetchData
            }
        })

        return response.data
    }

    static toggleFollow = async ({ user_id }) => {
        if (!user_id) {
            throw new Error("user_id is required")
        }

        const response = await request({
            method: "POST",
            url: `/users/${user_id}/follow`,
        })

        return response.data
    }
}