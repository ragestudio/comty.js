import request from "../../request"
import Settings from "../../helpers/withSettings"

export default class Post {
    static get maxPostTextLength() {
        return 3200
    }

    static get maxCommentLength() {
        return 1200
    }

    static getPostingPolicy = async () => {
        const { data } = await request({
            method: "GET",
            url: "/posting_policy",
        })

        return data
    }

    static getPost = async ({ post_id }) => {
        if (!post_id) {
            throw new Error("Post ID is required")
        }

        const { data } = await request({
            method: "GET",
            url: `/posts/${post_id}/data`,
        })

        return data
    }

    static async replies({ post_id, trim, limit }) {
        if (!post_id) {
            throw new Error("Post ID is required")
        }

        const { data } = await request({
            method: "GET",
            url: `/posts/${post_id}/replies`,
            params: {
                trim: trim ?? 0,
                limit: limit ?? Settings.get("feed_max_fetch"),
            }
        })

        return data
    }

    static getSavedPosts = async ({ trim, limit }) => {
        const { data } = await request({
            method: "GET",
            url: `/posts/saved`,
            params: {
                trim: trim ?? 0,
                limit: limit ?? Settings.get("feed_max_fetch"),
            }
        })

        return data
    }

    static getLikedPosts = async ({ trim, limit }) => {
        const { data } = await request({
            method: "GET",
            url: `/posts/liked`,
            params: {
                trim: trim ?? 0,
                limit: limit ?? Settings.get("feed_max_fetch"),
            }
        })

        return data
    }

    static getUserPosts = async ({ user_id, trim, limit }) => {
        if (!user_id) {
            // use current user_id
            user_id = app.userData?._id
        }

        const { data } = await request({
            method: "GET",
            url: `/posts/user/${user_id}`,
            params: {
                trim: trim ?? 0,
                limit: limit ?? Settings.get("feed_max_fetch"),
            }
        })

        return data
    }

    static toggleLike = async ({ post_id }) => {
        if (!post_id) {
            throw new Error("Post ID is required")
        }

        const { data } = await request({
            method: "POST",
            url: `/posts/${post_id}/toggle_like`,
        })

        return data
    }

    static toggleSave = async ({ post_id }) => {
        if (!post_id) {
            throw new Error("Post ID is required")
        }

        const { data } = await request({
            method: "POST",
            url: `/posts/${post_id}/toggle_save`,
        })

        return data
    }

    static create = async (payload) => {
        const { data } = await request({
            method: "POST",
            url: `/posts/new`,
            data: payload,
        })

        return data
    }

    static update = async (post_id, update) => {
        if (!post_id) {
            throw new Error("Post ID is required")
        }

        const { data } = await request({
            method: "PUT",
            url: `/posts/${post_id}/update`,
            data: update,
        })

        return data
    }

    static deletePost = async ({ post_id }) => {
        if (!post_id) {
            throw new Error("Post ID is required")
        }

        const { data } = await request({
            method: "DELETE",
            url: `/posts/${post_id}`,
        })

        return data
    }
}