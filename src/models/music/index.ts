import type { PaginatedRequest } from "../../types"

import BaseModel from "../../classes/BaseModel"

import * as v from "valibot"
import { Definition } from "../../decorators/Definition"
import { Validate } from "../../decorators/Validate"

import getMyLibrary from "./methods/getMyLibrary"
import getReleaseData from "./methods/getReleaseData"

export class MusicModel extends BaseModel {
	/**
	 * Get all tracks
	 */
	@Definition(
		({ user_id, limit, page }: { user_id: string } & PaginatedRequest) => ({
			method: "GET",
			url: "/music/tracks",
			params: { user_id, limit, page },
		}),
	)
	getAllTracks: (args: { user_id: string } & PaginatedRequest) => Promise<any>

	/**
	 * Get track data
	 */
	@Validate(v.pipe(v.string(), v.minLength(1, "id is required")))
	@Definition((id, options = {}) => ({
		method: "GET",
		url: `/music/tracks/${id}/data`,
		params: options,
	}))
	getTrackData: (id: string, options?: any) => Promise<any>

	/**
	 * Put track
	 */
	@Definition((track) => ({
		method: "PUT",
		url: "/music/tracks",
		data: track,
	}))
	putTrack: (track: any) => Promise<any>

	/**
	 * Get track lyrics
	 */
	@Validate(v.pipe(v.string(), v.minLength(1, "id is required")))
	@Definition((id, options = {}) => ({
		method: "GET",
		url: `/music/tracks/${id}/lyrics`,
		params: options,
	}))
	getTrackLyrics: (
		id: string,
		options?: { language?: string },
	) => Promise<any>

	/**
	 * Put track lyrics
	 */
	@Validate(v.pipe(v.string(), v.minLength(1, "track_id is required")))
	@Definition((track_id, data) => ({
		method: "PUT",
		url: `/music/tracks/${track_id}/lyrics`,
		data: data,
	}))
	putTrackLyrics: (track_id: string, data: any) => Promise<any>

	/**
	 * Get track timings
	 */
	@Validate(v.pipe(v.string(), v.minLength(1, "track_id is required")))
	@Definition((track_id) => ({
		method: "GET",
		url: `/music/tracks/${track_id}/timings`,
	}))
	getTimings: (track_id: string) => Promise<any>

	/**
	 * Get my releases
	 */
	@Definition(
		({
			limit,
			offset,
			keywords,
		}: PaginatedRequest & { keywords?: string }) => ({
			method: "GET",
			url: "/music/my/releases",
			params: { limit, offset, keywords },
		}),
	)
	getMyReleases: (
		args: PaginatedRequest & { keywords?: string },
	) => Promise<any>

	/**
	 * Get all releases
	 */
	@Definition(
		({ user_id, limit, page }: { user_id: string } & PaginatedRequest) => ({
			method: "GET",
			url: "/music/releases",
			params: { user_id, limit, page },
		}),
	)
	getAllReleases: (
		args: { user_id: string } & PaginatedRequest,
	) => Promise<any>

	/**
	 * Put release
	 */
	@Definition((release) => ({
		method: "PUT",
		url: "/music/releases",
		data: release,
	}))
	putRelease: (release: any) => Promise<any>

	/**
	 * Delete release
	 */
	@Validate(v.pipe(v.string(), v.minLength(1, "release_id is required")))
	@Definition((release_id) => ({
		method: "DELETE",
		url: `/music/releases/${release_id}`,
	}))
	deleteRelease: (release_id: string) => Promise<any>

	/**
	 * Toggle item favorite
	 */
	@Validate(
		v.pipe(v.string(), v.minLength(1, "type is required")),
		v.pipe(v.string(), v.minLength(1, "item_id is required")),
	)
	@Definition((type, item_id, to?: boolean) => ({
		method: "PUT",
		url: `/music/my/library/favorite`,
		data: { kind: type.toLowerCase(), item_id, to },
	}))
	toggleItemFavorite: (
		type: string,
		item_id: string,
		to?: boolean,
	) => Promise<any>
	get toggleItemFavourite() {
		return this.toggleItemFavorite
	}

	/**
	 * Check if item is favorited
	 */
	@Validate(
		v.pipe(v.string(), v.minLength(1, "type is required")),
		v.pipe(v.string(), v.minLength(1, "item_id is required")),
	)
	@Definition((type, item_id) => ({
		method: "GET",
		url: `/music/my/library/favorite`,
		params: { kind: type.toLowerCase(), item_id },
	}))
	isItemFavorited: (type: string, item_id: string) => Promise<any>
	get isItemFavourited() {
		return this.isItemFavorited
	}

	/**
	 * Search music
	 */
	@Definition(
		({
			keywords,
			limit,
			offset,
		}: PaginatedRequest & { keywords: string }) => ({
			method: "GET",
			url: "/music/search",
			params: { keywords, limit, offset },
		}),
	)
	search: (args: PaginatedRequest & { keywords: string }) => Promise<any>

	/**
	 * Get recently played
	 */
	@Definition((params?: any) => ({
		method: "GET",
		url: `/music/recently`,
		params: params,
	}))
	getRecentlyPlayed: (params?: any) => Promise<any>

	/**
	 * Get my library
	 */
	getMyLibrary = getMyLibrary.bind(this) as OmitThisParameter<
		typeof getMyLibrary
	>

	/**
	 * Get release data
	 */
	getReleaseData = getReleaseData.bind(this) as OmitThisParameter<
		typeof getReleaseData
	>
}

export default new MusicModel()
