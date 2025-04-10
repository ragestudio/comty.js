import Getters from "./getters"
import Setters from "./setters"

export default class MusicModel {
	static Getters = Getters
	static Setters = Setters

	// track related methods
	static getMyTracks = null
	static getAllTracks = Getters.tracks
	static getTrackData = Getters.trackData
	static putTrack = Setters.putTrack
	static deleteTrack = null

	// lyrics related methods
	static getTrackLyrics = Getters.trackLyrics
	static putTrackLyrics = Setters.putTrackLyrics

	// release related methods
	static getMyReleases = Getters.myReleases
	static getAllReleases = Getters.releases
	static getReleaseData = Getters.releaseData
	static putRelease = Setters.putRelease
	static deleteRelease = Setters.deleteRelease

	// library related methods
	static getMyLibrary = Getters.library
	static toggleItemFavorite = Setters.toggleItemFavorite
	static isItemFavorited = Getters.isItemFavorited

	// other methods
	static getRecentyPlayed = Getters.recentlyPlayed
	static search = Getters.search

	// aliases
	static toggleItemFavourite = MusicModel.toggleItemFavorite
	static isItemFavourited = MusicModel.isItemFavorited
}
