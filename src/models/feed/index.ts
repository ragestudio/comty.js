import type { PaginatedResponse, PaginatedRequest } from "../../types"

import BaseModel from "../../classes/BaseModel"

class FeedModel extends BaseModel {
	/**
	 * Retrieves music feed
	 */
	getMusicFeed = this.definition<Promise<PaginatedResponse<object>>>()(
		({ page, limit }: PaginatedRequest = {}) => ({
			method: "GET",
			url: `/music/feed/my`,
			params: {
				page: page ?? 0,
				limit: limit ?? 50,
			},
		}),
	)

	/**
	 * Retrieves the global music feed
	 */
	getGlobalMusicFeed = this.definition<Promise<PaginatedResponse<object>>>()(
		({ page, limit }: PaginatedRequest = {}) => ({
			method: "GET",
			url: `/music/feed`,
			params: {
				page: page ?? 0,
				limit: limit ?? 50,
			},
		}),
	)

	/**
	 * Retrieves the timeline feed
	 */
	getTimelineFeed = this.definition<Promise<PaginatedResponse<object>>>()(
		({ page, limit }: PaginatedRequest = {}) => ({
			method: "GET",
			url: `/posts/feed/timeline`,
			params: {
				page: page ?? 0,
				limit: limit ?? 50,
			},
		}),
	)

	/**
	 * Retrieves the global posts feed
	 */
	getGlobalTimelineFeed = this.definition<
		Promise<PaginatedResponse<object>>
	>()(({ page, limit }: PaginatedRequest = {}) => ({
		method: "GET",
		url: `/posts/feed/global`,
		params: {
			page: page ?? 0,
			limit: limit ?? 50,
		},
	}))
}

export default new FeedModel()
