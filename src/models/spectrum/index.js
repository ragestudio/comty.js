import axios from "axios"
import SessionService from "../session"

export default class Streaming {
    static apiHostname = process.env.NODE_ENV === "production" ? "https://live.ragestudio.net" : "https://fr01.ragestudio.net:8035"

    static get base() {
        const baseInstance = axios.create({
            baseURL: Streaming.apiHostname,
            headers: {
                "Accept": "application/json",
                "ngrok-skip-browser-warning": "any"
            }
        })

        if (SessionService.token) {
            baseInstance.defaults.headers.common["Authorization"] = `Bearer ${SessionService.token}`
        }

        return baseInstance
    }

    static async serverInfo() {
        const { data } = await Streaming.base({
            method: "get",
        })

        return {
            ...data,
            hostname: Streaming.apiHostname
        }
    }

    static async getOwnProfiles() {
        const { data } = await Streaming.base({
            method: "get",
            url: "/streaming/profiles/self",
        })

        return data
    }

    static async getProfile({ profile_id }) {
        if (!profile_id) {
            return null
        }

        const { data } = await Streaming.base({
            method: "get",
            url: `/streaming/profiles/${profile_id}`,
        })

        return data
    }

    static async getStream({ profile_id }) {
        if (!profile_id) {
            return null
        }

        const { data } = await Streaming.base({
            method: "get",
            url: `/streaming/${profile_id}`,
        })

        return data
    }

    static async deleteProfile({ profile_id }) {
        if (!profile_id) {
            return null
        }

        const { data } = await Streaming.base({
            method: "delete",
            url: `/streaming/profiles/${profile_id}`,
        })

        return data
    }

    static async createOrUpdateStream(update) {
        const { data } = await Streaming.base({
            method: "put",
            url: `/streaming/profiles/self`,
            data: update,
        })

        return data
    }

    static async getConnectionStatus({ profile_id }) {
        console.warn("getConnectionStatus() | Not implemented")
        return false
    }
}