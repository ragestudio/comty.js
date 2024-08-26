import request from "../../request"
import Settings from "../../helpers/withSettings"

export default class Post {
    /**
     * Retrieves the maximum length allowed for the post text.
     *
     * @return {number} The maximum length allowed for the post text.
     */
    static get maxPostTextLength() {
        return 3200
    }

    /**
     * Returns the maximum length allowed for a comment.
     *
     * @return {number} The maximum length allowed for a comment.
     */
    static get maxCommentLength() {
        return 1200
    }

    /**
     * Retrieves the posting policy from the server.
     *
     * @return {Promise<Object>} The posting policy data.
     */
    static async getPostingPolicy() {
        const { data } = await request({
            method: "GET",
            url: "/posting_policy",
        })

        return data
    }

    /**
     * Retrieves the data of a post by its ID.
     *
     * @param {Object} options - The options for retrieving the post.
     * @param {string} options.post_id - The ID of the post to retrieve.
     * @throws {Error} If the post_id is not provided.
     * @return {Promise<Object>} The data of the post.
     */
    static async post({ post_id }) {
        if (!post_id) {
            throw new Error("Post ID is required")
        }

        const { data } = await request({
            method: "GET",
            url: `/posts/${post_id}/data`,
        })

        return data
    }

    static getPost = Post.post

    /**
     * Retrieves the replies of a post by its ID.
     *
     * @param {Object} options - The options for retrieving the replies.
     * @param {string} options.post_id - The ID of the post to retrieve replies for.
     * @param {number} [options.trim=0] - The number of characters to trim the reply content.
     * @param {number} [options.limit=Settings.get("feed_max_fetch")] - The maximum number of replies to fetch.
     * @throws {Error} If the post_id is not provided.
     * @return {Promise<Object>} The data of the replies.
     */
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

    /**
     * Retrieves the saved posts with optional trimming and limiting.
     *
     * @param {Object} options - The options for retrieving the saved posts.
     * @param {number} [options.trim=0] - The number of posts to trim from the result.
     * @param {number} [options.limit=Settings.get("feed_max_fetch")] - The maximum number of posts to fetch.
     * @return {Promise<Object>} The data of the saved posts.
     */
    static async getSavedPosts({ trim, limit }) {
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

    /**
     * Retrieves the liked posts with optional trimming and limiting.
     *
     * @param {number} trim - The number of characters to trim the post content.
     * @param {number} limit - The maximum number of liked posts to fetch.
     * @return {Promise<Object>} The data of the liked posts.
     */
    static async getLikedPosts({ trim, limit }) {
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

    /**
     * Retrieves the posts of a user with optional trimming and limiting.
     *
     * @param {Object} options - The options for retrieving the user's posts.
     * @param {string} options.user_id - The ID of the user whose posts to retrieve. If not provided, the current user's ID will be used.
     * @param {number} [options.trim=0] - The number of characters to trim the post content.
     * @param {number} [options.limit=Settings.get("feed_max_fetch")] - The maximum number of posts to fetch.
     * @return {Promise<Object>} The data of the user's posts.
     */
    static async getUserPosts({ user_id, trim, limit }) {
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

    /**
     * Toggles the like status of a post.
     *
     * @param {Object} options - The options for toggling the like status.
     * @param {string} options.post_id - The ID of the post to toggle the like status.
     * @throws {Error} If the post_id is not provided.
     * @return {Promise<Object>} The response data after toggling the like status.
     */
    static async toggleLike({ post_id }) {
        if (!post_id) {
            throw new Error("Post ID is required")
        }

        const { data } = await request({
            method: "POST",
            url: `/posts/${post_id}/toggle_like`,
        })

        return data
    }

    /**
     * Toggles the save status of a post.
     *
     * @param {string} post_id - The ID of the post to toggle the save status.
     * @return {Promise<Object>} The response data after toggling the save status.
     */
    static async toggleSave({ post_id }) {
        if (!post_id) {
            throw new Error("Post ID is required")
        }

        const { data } = await request({
            method: "POST",
            url: `/posts/${post_id}/toggle_save`,
        })

        return data
    }

    /**
     * Creates a new post with the given payload.
     *
     * @param {Object} payload - The data to create the post with.
     * @return {Promise<Object>} The response data after creating the post.
     */
    static async create(payload) {
        const { data } = await request({
            method: "POST",
            url: `/posts/new`,
            data: payload,
        })

        return data
    }

    static createPost = Post.create

    /**
     * Updates a post with the given post ID and update payload.
     *
     * @param {string} post_id - The ID of the post to update.
     * @param {Object} update - The data to update the post with.
     * @throws {Error} If the post_id is not provided.
     * @return {Promise<Object>} The response data after updating the post.
     */
    static async update(post_id, update) {
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

    static updatePost = Post.update

    /**
     * Deletes a post with the given post ID.
     *
     * @param {string} post_id - The ID of the post to delete.
     * @return {Object} The response data after deleting the post.
     */
    static async delete({ post_id }) {
        if (!post_id) {
            throw new Error("Post ID is required")
        }

        const { data } = await request({
            method: "DELETE",
            url: `/posts/${post_id}`,
        })

        return data
    }

    static deletePost = Post.delete
}