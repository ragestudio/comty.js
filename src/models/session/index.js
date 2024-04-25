import jwt_decode from "jwt-decode"
import request from "../../request"
import Storage from "../../helpers/withStorage"

export default class Session {
    static storageTokenKey = "token"
    static storageRefreshTokenKey = "refreshToken"

    static get token() {
        return Storage.engine.get(this.storageTokenKey)
    }

    static set token(token) {
        return Storage.engine.set(this.storageTokenKey, token)
    }

    static get refreshToken() {
        return Storage.engine.get(this.storageRefreshTokenKey)
    }

    static set refreshToken(token) {
        return Storage.engine.set(this.storageRefreshTokenKey, token)
    }

    static get roles() {
        return this.getDecodedToken()?.roles
    }

    static get user_id() {
        return this.getDecodedToken()?.user_id
    }

    static get session_uuid() {
        return this.getDecodedToken()?.session_uuid
    }

    static getDecodedToken = () => {
        const token = this.token

        return token && jwt_decode(token)
    }

    static removeToken() {
        return Storage.engine.remove(Session.storageTokenKey)
    }

    static getAllSessions = async () => {
        const response = await request({
            method: "get",
            url: "/sessions/all"
        })

        return response.data
    }

    static getCurrentSession = async () => {
        const response = await request({
            method: "get",
            url: "/sessions/current"
        })

        return response.data
    }

    static getTokenValidation = async () => {
        const session = await Session.token

        const response = await request({
            method: "get",
            url: "/sessions/validate",
            data: {
                session: session
            }
        })

        return response.data
    }

    static destroyCurrentSession = async () => {
        const token = await Session.token
        const session = await Session.getDecodedToken()

        if (!session || !token) {
            return false
        }

        const response = await request({
            method: "delete",
            url: "/sessions/current"
        }).catch((error) => {
            console.error(error)

            return false
        })

        Session.removeToken()

        __comty_shared_state.eventBus.emit("session.destroyed")

        return response.data
    }

    static destroyAllSessions = async () => {
        throw new Error("Not implemented")
    }

    // alias for validateToken method
    static validSession = async (token) => {
        return await Session.validateToken(token)
    }

    static isCurrentTokenValid = async () => {
        const health = await Session.getTokenValidation()

        return health.valid
    }
}