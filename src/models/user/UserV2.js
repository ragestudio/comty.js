import getMethod from "./methods/data"
import getAvatarMethod from "./methods/getAvatar"
import getBadgesMethod from "./methods/getBadges"
import getDecorationsMethod from "./methods/v2/getDecorations"
import getRolesMethod from "./methods/getRoles"

import getConfigMethod from "./methods/getConfig"
import updateConfigMethod from "./methods/updateConfig"

export default class UserV2 {
	static get = getMethod
	static avatar = getAvatarMethod

	static config = {
		get: getConfigMethod,
		update: updateConfigMethod,
	}

	static roles = {
		get: getRolesMethod,
	}

	static badges = {
		get: getBadgesMethod,
	}

	static decorations = {
		get: getDecorationsMethod,
	}
}
