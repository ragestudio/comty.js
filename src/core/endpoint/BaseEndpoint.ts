import Client from "../client"

export default class BaseEndpoint {
	constructor() {
		let currentProto = Object.getPrototypeOf(this)

		while (currentProto && currentProto !== BaseEndpoint.prototype) {
			const keys = Object.getOwnPropertyNames(currentProto)

			for (const key of keys) {
				if (key === "constructor") continue

				const descriptor = Object.getOwnPropertyDescriptor(
					currentProto,
					key,
				)

				if (descriptor && typeof descriptor.value === "function") {
					if (!Object.prototype.hasOwnProperty.call(this, key)) {
						;(this as any)[key] = descriptor.value.bind(this)
					}
				}
			}

			currentProto = Object.getPrototypeOf(currentProto)
		}
	}

	get request() {
		return Client.instance
	}

	get instance() {
		return Client.instance
	}
}
