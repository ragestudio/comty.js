import Getters from "./getters"
import Setters from "./setters"

export default class MusicModel {
    public static Getters = Getters
    public static Setters = Setters

    /**
    * Performs a search based on the provided keywords, with optional parameters for limiting the number of results and pagination.
    *
    * @param {string} keywords - The keywords to search for.
    * @param {object} options - An optional object containing additional parameters.
    * @param {number} options.limit - The maximum number of results to return. Defaults to 5.
    * @param {number} options.offset - The offset to start returning results from. Defaults to 0.
    * @param {boolean} options.useTidal - Whether to use Tidal for the search. Defaults to false.
    * @return {Promise<Object>} The search results.
    */
    public static search = Getters.search

    /**
    * Retrieves playlist items based on the provided parameters.
    *
    * @param {Object} options - The options object.
    * @param {string} options.playlist_id - The ID of the playlist.
    * @param {string} options.service - The service from which to retrieve the playlist items.
    * @param {number} options.limit - The maximum number of items to retrieve.
    * @param {number} options.offset - The number of items to skip before retrieving.
    * @return {Promise<Object>} Playlist items data.
    */
    public static getPlaylistItems = Getters.PlaylistItems

    /**
    * Retrieves playlist data based on the provided parameters.
    *
    * @param {Object} options - The options object.
    * @param {string} options.playlist_id - The ID of the playlist.
    * @param {string} options.service - The service to use.
    * @param {number} options.limit - The maximum number of items to retrieve.
    * @param {number} options.offset - The offset for pagination.
    * @return {Promise<Object>} Playlist data.
    */
    public static getPlaylistData = Getters.PlaylistData

    /**
    * Retrieves releases based on the provided parameters.
    *  If user_id is not provided, it will retrieve self authenticated user releases.
    *
    * @param {object} options - The options for retrieving releases.
    * @param {string} options.user_id - The ID of the user.
    * @param {string[]} options.keywords - The keywords to filter releases by.
    * @param {number} options.limit - The maximum number of releases to retrieve.
    * @param {number} options.offset - The offset for paginated results.
    * @return {Promise<Object>} - A promise that resolves to the retrieved releases.
    */
    public static getReleases = Getters.releases

    /**
    * Retrieves self releases.
    *
    * @param {object} options - The options for retrieving my releases.
    * @param {number} options.limit - The maximum number of releases to retrieve.
    * @param {number} options.offset - The offset for paginated results.
    * @return {Promise<Object>} - A promise that resolves to the retrieved releases.
    */
    public static getMyReleases = Getters.myReleases

    /**
    * Retrieves release data by ID.
    *
    * @param {number} id - The ID of the release.
    * @return {Promise<Object>} The release data.
    */
    public static getReleaseData = Getters.releaseData

    /**
    * Retrieves track data for a given ID.
    *
    * @param {string} id - The ID of the track or multiple IDs separated by commas.
    * @return {Promise<Object>} The track data.
    */
    public static getTrackData = Getters.trackData

    /**
    * Retrieves the official featured playlists.
    *
    * @return {Promise<Object>} The data containing the featured playlists.
    */
    public static getFeaturedPlaylists = Getters.featuredPlaylists

    /**
    * Retrieves track lyrics for a given ID.
    *
    * @param {string} id - The ID of the track.
    * @return {Promise<Object>} The track lyrics.
    */
    public static getTrackLyrics = Getters.trackLyrics


    public static putTrackLyrics = Setters.putTrackLyrics

    /**
    * Create or modify a track.
    *
    * @param {object} TrackManifest - The track manifest.
    * @return {Promise<Object>} The result track data.
    */
    public static putTrack = Setters.putTrack

    /**
    * Create or modify a release.
    *
    * @param {object} ReleaseManifest - The release manifest.
    * @return {Promise<Object>} The result release data.
    */
    public static putRelease = Setters.putRelease

    /**
    * Deletes a release by its ID.
    *
    * @param {string} id - The ID of the release to delete.
    * @return {Promise<Object>} - A Promise that resolves to the data returned by the API.
    */
    public static deleteRelease = Setters.deleteRelease

    /**
     * Retrieves the favourite tracks of the current user.
     * 
     * @return {Promise<Object>} The favorite tracks data.
     */
    public static getFavouriteTracks = null

    /**
     * Retrieves the favourite tracks/playlists/releases of the current user.
     *  
     * @return {Promise<Object>} The favorite playlists data.
     */
    public static getFavouriteFolder = Getters.favouriteFolder

    /**
     * Toggles the favourite status of a track, playlist or folder.
     * 
     * @param {string} track_id - The ID of the track to toggle the favorite status.
     * @throws {Error} If the track_id is not provided.
     * @return {Promise<Object>} The response data after toggling the favorite status.
     */
    public static toggleItemFavourite = Setters.toggleItemFavourite

    public static isItemFavourited = Getters.isItemFavourited
}