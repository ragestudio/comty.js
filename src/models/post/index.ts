import BaseModel from "../../classes/BaseModel"

import * as v from "valibot"
import { Definition } from "../../decorators/Definition"
import { Validate } from "../../decorators/Validate"

export class PostModel extends BaseModel {
	/**
	 * Retrieves a post by its ID.
	 */
	@Validate(v.pipe(v.string(), v.minLength(1, "post_id is required")))
	@Definition((post_id) => ({
		method: "GET",
		url: `/posts/${post_id}`,
	}))
	get: (post_id: string) => Promise<any>

	/**
	 * Retrieves the replies of a post by its ID.
	 */
	@Validate(v.object({ post_id: v.pipe(v.string(), v.minLength(1)) }))
	@Definition(({ post_id, page, limit }) => ({
		method: "GET",
		url: `/posts/${post_id}/replies`,
		params: { page: page ?? 0, limit: limit ?? 50 },
	}))
	replies: (opts: {
		post_id: string
		page?: number
		limit?: number
	}) => Promise<any>

	/**
	 * Retrieves the saved posts.
	 */
	@Definition(({ page, limit } = {}) => ({
		method: "GET",
		url: `/posts/saved`,
		params: { page: page ?? 0, limit: limit ?? 50 },
	}))
	getSavedPosts: (opts?: { page?: number; limit?: number }) => Promise<any>

	/**
	 * Retrieves the liked posts.
	 */
	@Definition(({ page, limit } = {}) => ({
		method: "GET",
		url: `/posts/liked`,
		params: { page: page ?? 0, limit: limit ?? 50 },
	}))
	getLikedPosts: (opts?: { page?: number; limit?: number }) => Promise<any>

	/**
	 * Retrieves the posts of a user.
	 */
	@Definition(({ user_id, page, limit }) => ({
		method: "GET",
		url: user_id ? `/posts/user/${user_id}` : `/posts/user/self`,
		params: { page: page ?? 0, limit: limit ?? 50 },
	}))
	getUserPosts: (opts: {
		user_id?: string
		page?: number
		limit?: number
	}) => Promise<any>

	/**
	 * Toggles the like status of a post.
	 */
	@Validate(v.object({ post_id: v.pipe(v.string(), v.minLength(1)) }))
	@Definition(({ post_id }) => ({
		method: "POST",
		url: `/posts/${post_id}/toggle_like`,
	}))
	toggleLike: (opts: { post_id: string }) => Promise<any>

	/**
	 * Toggles the save status of a post.
	 */
	@Validate(v.object({ post_id: v.pipe(v.string(), v.minLength(1)) }))
	@Definition(({ post_id }) => ({
		method: "POST",
		url: `/posts/${post_id}/toggle_save`,
	}))
	toggleSave: (opts: { post_id: string }) => Promise<any>

	/**
	 * Creates a new post with the given payload.
	 */
	@Definition((payload) => ({
		method: "POST",
		url: `/posts/new`,
		data: payload,
	}))
	create: (payload: any) => Promise<any>
	get createPost() { return this.create }

	/**
	 * Updates a post.
	 */
	@Validate(v.pipe(v.string(), v.minLength(1)))
	@Definition((post_id, update) => ({
		method: "PUT",
		url: `/posts/${post_id}/update`,
		data: update,
	}))
	update: (post_id: string, update: any) => Promise<any>
	get updatePost() { return this.update }

	/**
	 * Deletes a post.
	 */
	@Validate(v.object({ post_id: v.pipe(v.string(), v.minLength(1)) }))
	@Definition(({ post_id }) => ({
		method: "DELETE",
		url: `/posts/${post_id}`,
	}))
	delete: (opts: { post_id: string }) => Promise<any>
	get deletePost() { return this.delete }

	/**
	 * Votes for a poll.
	 */
	@Validate(v.object({ post_id: v.string(), option_id: v.string() }))
	@Definition(({ post_id, option_id }) => ({
		method: "POST",
		url: `/posts/${post_id}/vote_poll/${option_id}`,
	}))
	votePoll: (opts: { post_id: string; option_id: string }) => Promise<any>

	/**
	 * Deletes a vote for a poll.
	 */
	@Validate(v.object({ post_id: v.string(), option_id: v.string() }))
	@Definition(({ post_id, option_id }) => ({
		method: "DELETE",
		url: `/posts/${post_id}/vote_poll/${option_id}`,
	}))
	deleteVotePoll: (opts: {
		post_id: string
		option_id: string
	}) => Promise<any>

	/**
	 * Retrieves trending hashtags.
	 */
	@Definition(() => ({
		method: "GET",
		url: `/posts/trendings`,
	}))
	getTrendings: () => Promise<any[]>

	/**
	 * Retrieves trending posts for a specific hashtag.
	 */
	@Definition(({ trending, page, limit } = {}) => ({
		method: "GET",
		url: `/posts/trending/${trending}`,
		params: { page: page ?? 0, limit: limit ?? 50 },
	}))
	getTrending: (opts?: {
		trending: string
		page?: number
		limit?: number
	}) => Promise<any[]>
}

export default new PostModel()
