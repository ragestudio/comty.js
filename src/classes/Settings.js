export default class Settings {
	static get = (key) => {
		if (typeof window === "undefined") {
			return null
		}

		return globalThis.app?.cores?.settings.get(key)
	}

	static set = (key, value) => {
		if (typeof window === "undefined") {
			return null
		}

		return globalThis.app?.cores?.settings.set(key, value)
	}

	static is = (key) => {
		if (typeof window === "undefined") {
			return null
		}

		return globalThis.app?.cores?.settings.is(key)
	}
}
