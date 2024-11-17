import request from "../../request"

export default class Search {
    /**
     * Performs a search using the provided keywords and optional parameters.
     *
     * @param {string} keywords - The keywords to search for.
     * @param {Object} [params={}] - Optional parameters for the search.
     * @return {Promise<Object>} A promise that resolves with the search results.
     */
    static async search(keywords, params = {}) {
        const { data } = await request({
            method: "GET",
            url: `/search`,
            params: {
                keywords: keywords,
                params: params
            }
        })

        return data
    }

    /**
     * Searches for users with the given keywords and optional parameters.
     *
     * @param {string} keywords - The keywords to search for.
     * @param {Object} [params={}] - Optional parameters for the search.
     * @return {Promise<Object>} A promise that resolves with the search results.
     */
    static async userSearch(keywords, {limit = 50} = {}) {
        const { data } = await request({
            method: "GET",
            url: `/users/search`,
            params: {
                keywords: keywords,
                limit: limit,
            }
        })

        return data
    }

    /**
     * Performs a quick search using the provided parameters.
     *
     * @param {Object} params - The parameters for the search.
     * @return {Promise<Object>} A promise that resolves with the search results data.
     */
    static async quickSearch(params) {
        const response = await request({
            method: "GET",
            url: "/search/quick",
            params: params
        })

        return response.data
    }
}