import SessionModel from "../session"
import request from "../../request"

export default class User {
    static data = async (payload = {}) => {
        let {
            username,
            user_id,
        } = payload

        if (!username && !user_id) {
            user_id = SessionModel.user_id
        }

        if (username && !user_id) {
            // resolve user_id from username
            const resolveResponse = await request({
                method: "GET",
                url: `/users/${username}/resolve-user_id`,
            })

            user_id = resolveResponse.data.user_id
        }

        const response = await request({
            method: "GET",
            url: `/users/${user_id}/data`,
        })

        return response.data
    }

    static updateData = async (payload) => {
        const response = await request({
            method: "POST",
            url: "/users/self/update",
            data: {
                update: payload,
            },
        })

        return response.data
    }

    static unsetFullName = async () => {
        return await User.updateData({
            full_name: null,
        })
    }

    static selfRoles = async () => {
        const response = await request({
            method: "GET",
            url: "/users/self/roles",
        })

        return response.data
    }

    static haveRole = async (role) => {
        const roles = await User.selfRoles()

        if (!roles) {
            return false
        }

        return Array.isArray(roles) && roles.includes(role)
    }

    static haveAdmin = async () => {
        return User.haveRole("admin")
    }

    static getUserBadges = async (user_id) => {
        if (!user_id) {
            user_id = SessionModel.user_id
        }

        const { data } = await request({
            method: "GET",
            url: `/users/${user_id}/badges`,
        })

        return data
    }

    static getUserFollowers = async ({
        user_id,
        limit = 20,
        offset = 0,
    }) => {
        // if user_id or username is not provided, set with current user
        if (!user_id && !username) {
            user_id = SessionModel.user_id
        }

        const { data } = await request({
            method: "GET",
            url: `/user/${user_id}/followers`,
            params: {
                limit,
                offset,
            }
        })

        return data
    }

    static getConnectedUsersFollowing = async () => {
        const { data } = await request({
            method: "GET",
            url: "/status/connected/following",
        })

        return data
    }

    static checkUsernameAvailability = async (username) => {
        const { data } = await request({
            method: "GET",
            url: `/availability`,
            params: {
                username,
            }
        })

        return data
    }

    static checkEmailAvailability = async (email) => {
        const { data } = await request({
            method: "GET",
            url: `/availability`,
            params: {
                email,
            }
        })

        return data
    }

    /**
     * Retrive user config from server
     *
     * @param {type} key - A key of config
     * @return {object} - Config object
     */
    static async getConfig(key) {
        const { data } = await request({
            method: "GET",
            url: "/users/self/config",
            params: {
                key
            }
        })

        return data
    }

    /**
     * Update the configuration with the given update.
     *
     * @param {Object} update - The object containing the updated configuration data
     * @return {Promise} A Promise that resolves with the response data after the configuration is updated
     */
    static async updateConfig(update) {
        const { data } = await request({
            method: "PUT",
            url: "/users/self/config",
            data: update
        })

        return data
    }
}