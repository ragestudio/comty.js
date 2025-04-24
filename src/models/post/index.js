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
	 * @param {number} [options.page=0] - The number of characters to page the reply content.
	 * @param {number} [options.limit=Settings.get("feed_max_fetch")] - The maximum number of replies to fetch.
	 * @throws {Error} If the post_id is not provided.
	 * @return {Promise<Object>} The data of the replies.
	 */
	static async replies({ post_id, page, limit }) {
		if (!post_id) {
			throw new Error("Post ID is required")
		}

		const { data } = await request({
			method: "GET",
			url: `/posts/${post_id}/replies`,
			params: {
				page: page ?? 0,
				limit: limit ?? Settings.get("feed_max_fetch"),
			},
		})

		return data
	}

	/**
	 * Retrieves the saved posts with optional trimming and limiting.
	 *
	 * @param {Object} options - The options for retrieving the saved posts.
	 * @param {number} [options.page=0] - The number of posts to page from the result.
	 * @param {number} [options.limit=Settings.get("feed_max_fetch")] - The maximum number of posts to fetch.
	 * @return {Promise<Object>} The data of the saved posts.
	 */
	static async getSavedPosts({ page, limit }) {
		const { data } = await request({
			method: "GET",
			url: `/posts/saved`,
			params: {
				page: page ?? 0,
				limit: limit ?? Settings.get("feed_max_fetch"),
			},
		})

		return data
	}

	/**
	 * Retrieves the liked posts with optional trimming and limiting.
	 *
	 * @param {number} page - The number of characters to page the post content.
	 * @param {number} limit - The maximum number of liked posts to fetch.
	 * @return {Promise<Object>} The data of the liked posts.
	 */
	static async getLikedPosts({ page, limit }) {
		const { data } = await request({
			method: "GET",
			url: `/posts/liked`,
			params: {
				page: page ?? 0,
				limit: limit ?? Settings.get("feed_max_fetch"),
			},
		})

		return data
	}

	/**
	 * Retrieves the posts of a user with optional trimming and limiting.
	 *
	 * @param {Object} options - The options for retrieving the user's posts.
	 * @param {string} options.user_id - The ID of the user whose posts to retrieve. If not provided, the current user's ID will be used.
	 * @param {number} [options.page=0] - The number of characters to page the post content.
	 * @param {number} [options.limit=Settings.get("feed_max_fetch")] - The maximum number of posts to fetch.
	 * @return {Promise<Object>} The data of the user's posts.
	 */
	static async getUserPosts({ user_id, page, limit }) {
		if (!user_id) {
			// use current user_id
			user_id = app.userData?._id
		}

		const { data } = await request({
			method: "GET",
			url: `/posts/user/${user_id}`,
			params: {
				page: page ?? 0,
				limit: limit ?? Settings.get("feed_max_fetch"),
			},
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

	/**
	 * Votes for a poll with the given post ID and option ID.
	 *
	 * @param {Object} options - The options for voting.
	 * @param {string} options.post_id - The ID of the post to vote for.
	 * @param {string} options.option_id - The ID of the option to vote for.
	 * @throws {Error} If the post_id or option_id is not provided.
	 * @return {Promise<Object>} The response data after voting.
	 */
	static async votePoll({ post_id, option_id }) {
		if (!post_id) {
			throw new Error("post_id is required")
		}

		if (!option_id) {
			throw new Error("option_id is required")
		}

		const { data } = await request({
			method: "POST",
			url: `/posts/${post_id}/vote_poll/${option_id}`,
		})

		return data
	}

	/**
	 * Deletes a vote for a poll with the given post ID and option ID.
	 *
	 * @param {Object} options - The options for deleting a vote.
	 * @param {string} options.post_id - The ID of the post to delete the vote from.
	 * @param {string} options.option_id - The ID of the option to delete the vote from.
	 * @throws {Error} If the post_id or option_id is not provided.
	 * @return {Promise<Object>} The response data after deleting the vote.
	 */
	static async deleteVotePoll({ post_id, option_id }) {
		if (!post_id) {
			throw new Error("post_id is required")
		}

		if (!option_id) {
			throw new Error("option_id is required")
		}

		const { data } = await request({
			method: "DELETE",
			url: `/posts/${post_id}/vote_poll/${option_id}`,
		})

		return data
	}

	/**
	 * Retrieves the trending hashtags and their counts.
	 *
	 * @return {Promise<Object[]>} An array of objects with two properties: "hashtag" and "count".
	 */
	static async getTrendings() {
		const { data } = await request({
			method: "GET",
			url: `/posts/trendings`,
		})

		return data
	}

	/**
	 * Retrieves the trending posts for a specific hashtag with optional trimming and limiting.
	 *
	 * @param {Object} options - The options for retrieving trending posts.
	 * @param {string} options.trending - The hashtag to retrieve trending posts for.
	 * @param {number} [options.page=0] - The number of characters to page the post content.
	 * @param {number} [options.limit=Settings.get("feed_max_fetch")] - The maximum number of posts to fetch.
	 * @return {Promise<Object[]>} An array of posts that are trending for the given hashtag.
	 */
	static async getTrending({ trending, page, limit } = {}) {
		const { data } = await request({
			method: "GET",
			url: `/posts/trending/${trending}`,
			params: {
				page: page ?? 0,
				limit: limit ?? Settings.get("feed_max_fetch"),
			},
		})

		return data
	}
}
