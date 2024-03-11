import request from "../../handlers/request"
import SessionModel from "../session"

export default class AuthModel {
    static login = async (payload, callback) => {
        const response = await request({
            method: "post",
            url: "/auth",
            data: {
                username: payload.username,
                password: payload.password,
                mfa_code: payload.mfa_code,
            },
        })

        if (response.data.mfa_required) {
            __comty_shared_state.eventBus.emit("auth:mfa_required")

            if (typeof callback === "function") {
                await callback({
                    mfa_required: {
                        method: response.data.method,
                        sended_to: response.data.sended_to,
                    },
                })
            }

            return false
        }

        SessionModel.token = response.data.token

        if (typeof callback === "function") {
            await callback()
        }

        __comty_shared_state.eventBus.emit("auth:login_success")

        return response.data
    }

    static logout = async () => {
        await SessionModel.destroyCurrentSession()

        SessionModel.removeToken()

        __comty_shared_state.eventBus.emit("auth:logout_success")
    }

    static register = async (payload) => {
        const { username, password, email } = payload

        const response = await request({
            method: "post",
            url: "/auth/register",
            data: {
                username,
                password,
                email,
            }
        }).catch((error) => {
            console.error(error)

            return false
        })

        if (!response) {
            throw new Error("Unable to register user")
        }

        return response
    }

    static usernameValidation = async (username) => {
        const response = await request({
            method: "get",
            url: `/auth/${username}/exists`,
        }).catch((error) => {
            console.error(error)

            return false
        })

        if (!response) {
            throw new Error("Unable to validate user")
        }

        return response.data
    }
}