import request from "../../request"
import Settings from "../../helpers/withSettings"

export default class FeedModel {
	/**
	 * Retrieves music feed with optional trimming and limiting.
	 *
	 * @param {Object} options - Optional parameters for trimming and limiting the feed
	 * @param {number} options.page - The number of items to page from the feed
	 * @param {number} options.limit - The maximum number of items to fetch from the feed
	 * @return {Promise<Object>} The music feed data
	 */
	static async getMusicFeed({ page, limit } = {}) {
		const { data } = await request({
			method: "GET",
			url: `/music/feed/my`,
			params: {
				page: page ?? 0,
				limit: limit ?? Settings.get("feed_max_fetch"),
			},
		})

		return data
	}

	/**
	 * Retrieves the global music feed with optional trimming and limiting.
	 *
	 * @param {Object} options - An object containing optional parameters:
	 * @param {number} options.page - The number of items to page from the feed
	 * @param {number} options.limit - The maximum number of items to fetch from the feed
	 * @return {Promise<Object>} The global music feed data
	 */
	static async getGlobalMusicFeed({ page, limit } = {}) {
		const { data } = await request({
			method: "GET",
			url: `/music/feed`,
			params: {
				page: page ?? 0,
				limit: limit ?? Settings.get("feed_max_fetch"),
			},
		})

		return data
	}

	/**
	 * Retrieves the timeline feed with optional trimming and limiting.
	 *
	 * @param {object} options - Object containing page and limit properties
	 * @param {number} options.page - The number of feed items to page
	 * @param {number} options.limit - The maximum number of feed items to retrieve
	 * @return {Promise<object>} The timeline feed data
	 */
	static async getTimelineFeed({ page, limit } = {}) {
		const { data } = await request({
			method: "GET",
			url: `/posts/feed/timeline`,
			params: {
				page: page ?? 0,
				limit: limit ?? Settings.get("feed_max_fetch"),
			},
		})

		return data
	}

	/**
	 * Retrieves the posts feed with options to page and limit the results.
	 *
	 * @param {Object} options - An object containing optional parameters for trimming and limiting the feed.
	 * @param {number} options.page - The number of characters to page the feed content.
	 * @param {number} options.limit - The maximum number of posts to fetch from the feed.
	 * @return {Promise<Object>} The posts feed data.
	 */
	static async getGlobalTimelineFeed({ page, limit } = {}) {
		const { data } = await request({
			method: "GET",
			url: `/posts/feed/global`,
			params: {
				page: page ?? 0,
				limit: limit ?? Settings.get("feed_max_fetch"),
			},
		})

		return data
	}
}
