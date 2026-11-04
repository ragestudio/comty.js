import type { PaginatedResponse, PaginatedRequest } from "../../types"

import BaseEndpoint from "../../core/endpoint/BaseEndpoint"
import { Definition } from "../../core/endpoint/decorators/Definition"

class FeedModel extends BaseEndpoint {
	/**
	 * Retrieves music feed
	 */
	@Definition(({ page, limit }: PaginatedRequest = {}) => ({
		method: "GET",
		url: `/music/feed/my`,
		params: {
			page: page ?? 0,
			limit: limit ?? 50,
		},
	}))
	getMusicFeed!: (
		args?: PaginatedRequest,
	) => Promise<PaginatedResponse<object>>

	/**
	 * Retrieves the global music feed
	 */
	@Definition(({ page, limit }: PaginatedRequest = {}) => ({
		method: "GET",
		url: `/music/feed`,
		params: {
			page: page ?? 0,
			limit: limit ?? 50,
		},
	}))
	getGlobalMusicFeed!: (
		args?: PaginatedRequest,
	) => Promise<PaginatedResponse<object>>

	/**
	 * Retrieves the timeline feed
	 */
	@Definition(({ page, limit }: PaginatedRequest = {}) => ({
		method: "GET",
		url: `/posts/feed/timeline`,
		params: {
			page: page ?? 0,
			limit: limit ?? 50,
		},
	}))
	getTimelineFeed!: (
		args?: PaginatedRequest,
	) => Promise<PaginatedResponse<object>>

	/**
	 * Retrieves the global posts feed
	 */
	@Definition(({ page, limit }: PaginatedRequest = {}) => ({
		method: "GET",
		url: `/posts/feed/global`,
		params: {
			page: page ?? 0,
			limit: limit ?? 50,
		},
	}))
	getGlobalTimelineFeed!: (
		args?: PaginatedRequest,
	) => Promise<PaginatedResponse<object>>
}

export default new FeedModel()
