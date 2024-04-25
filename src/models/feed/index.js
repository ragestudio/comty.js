import request from "../../request"
import Settings from "../../helpers/withSettings"

export default class FeedModel {
    /**
     * Retrieves music feed with optional trimming and limiting.
     *
     * @param {Object} options - Optional parameters for trimming and limiting the feed
     * @param {number} options.trim - The number of items to trim from the feed
     * @param {number} options.limit - The maximum number of items to fetch from the feed
     * @return {Promise<Object>} The music feed data
     */
    static async getMusicFeed({ trim, limit } = {}) {
        const { data } = await request({
            method: "GET",
            url: `/music/feed/my`,
            params: {
                trim: trim ?? 0,
                limit: limit ?? Settings.get("feed_max_fetch"),
            }
        })

        return data
    }

    /**
     * Retrieves the global music feed with optional trimming and limiting.
     *
     * @param {Object} options - An object containing optional parameters:
      * @param {number} options.trim - The number of items to trim from the feed
     * @param {number} options.limit - The maximum number of items to fetch from the feed
     * @return {Promise<Object>} The global music feed data
     */
    static async getGlobalMusicFeed({ trim, limit } = {}) {
        const { data } = await request({
            method: "GET",
            url: `/music/feed`,
            params: {
                trim: trim ?? 0,
                limit: limit ?? Settings.get("feed_max_fetch"),
            }
        })

        return data
    }

    /**
     * Retrieves the timeline feed with optional trimming and limiting.
     *
     * @param {object} options - Object containing trim and limit properties
     * @param {number} options.trim - The number of feed items to trim
     * @param {number} options.limit - The maximum number of feed items to retrieve
     * @return {Promise<object>} The timeline feed data
     */
    static async getTimelineFeed({ trim, limit } = {}) {
        const { data } = await request({
            method: "GET",
            url: `/posts/feed/timeline`,
            params: {
                trim: trim ?? 0,
                limit: limit ?? Settings.get("feed_max_fetch"),
            }
        })

        return data
    }

    /**
     * Retrieves the posts feed with options to trim and limit the results.
     *
     * @param {Object} options - An object containing optional parameters for trimming and limiting the feed.
     * @param {number} options.trim - The number of characters to trim the feed content.
     * @param {number} options.limit - The maximum number of posts to fetch from the feed.
     * @return {Promise<Object>} The posts feed data.
     */
    static async getGlobalTimelineFeed({ trim, limit } = {}) {
        const { data } = await request({
            method: "GET",
            url: `/posts/feed/global`,
            params: {
                trim: trim ?? 0,
                limit: limit ?? Settings.get("feed_max_fetch"),
            }
        })

        return data
    }
}