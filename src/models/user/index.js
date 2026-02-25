import dataMethod from "./methods/data"
import unsetPublicNameMethod from "./methods/unsetPublicName"
import updateDataMethod from "./methods/updateData"

import getBadgesMethod from "./methods/getBadges"
import getRolesMethod from "./methods/getRoles"

import getConfigMethod from "./methods/getConfig"
import updateConfigMethod from "./methods/updateConfig"

import getAvatarMethod from "./methods/getAvatar"
import isUserConnectedMethod from "./methods/isUserConnected"

import getPublicKeyMethod from "./methods/getPublicKey"
import updatePublicKeyMethod from "./methods/updatePublicKey"

import V2 from "./UserV2"

export default class User {
	/**
	 * Retrieves the data of a user.
	 *
	 * @param {Object} payload - An object containing the username and user_id.
	 * @param {string} payload.username - The username of the user.
	 * @param {string} payload.user_id - The ID of the user.
	 * @return {Promise<Object>} - A promise that resolves with the data of the user.
	 */
	static data = dataMethod

	/**
	 * Updates the user data with the given payload.
	 *
	 * @param {Object} payload - The data to update the user with.
	 * @return {Promise<Object>} - A promise that resolves with the updated user data.
	 */
	static updateData = updateDataMethod

	/**
	 * Update the public name to null in the user data.
	 *
	 * @return {Promise} A Promise that resolves with the response data after updating the public name
	 */
	static unsetPublicName = unsetPublicNameMethod

	/**
	 * Retrieves the roles of a user.
	 *
	 * @param {string} user_id - The ID of the user. If not provided, the current user ID will be used.
	 * @return {Promise<Array>} An array of roles for the user.
	 */
	static getRoles = getRolesMethod

	/**
	 * Retrieves the badges for a given user.
	 *
	 * @param {string} user_id - The ID of the user. If not provided, the current session user ID will be used.
	 * @return {Promise<Array>} An array of badges for the user.
	 */
	static getBadges = getBadgesMethod

	/**
	 * Retrive user config from server
	 *
	 * @param {type} key - A key of config
	 * @return {object} - Config object
	 */
	static getConfig = getConfigMethod

	/**
	 * Update the configuration with the given update.
	 *
	 * @param {Object} update - The object containing the updated configuration data
	 * @return {Promise} A Promise that resolves with the response data after the configuration is updated
	 */
	static updateConfig = updateConfigMethod

	static getPublicKey = getPublicKeyMethod
	static updatePublicKey = updatePublicKeyMethod

	static getAvatar = getAvatarMethod

	static isUserConnected = isUserConnectedMethod

	static V2 = V2
}
