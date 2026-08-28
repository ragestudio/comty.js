import type { CustomRequest } from "../types"

import Request from "../request"
import Settings from "./Settings"
import Storage from "./Storage"

export default class BaseModel {
	constructor() {
		let currentProto = Object.getPrototypeOf(this)

		while (currentProto && currentProto !== BaseModel.prototype) {
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
		return Request
	}

	get settings() {
		return Settings
	}

	get storage() {
		return Storage
	}

	definition<ReturnType = any>() {
		return <Args extends any[]>(
			definitionFn: (...args: Args) => CustomRequest,
		): ((...args: Args) => Promise<ReturnType>) => {
			return async (...args: Args): Promise<ReturnType> => {
				const requestConfig = definitionFn.call(this, ...args)
				const res = await this.request(requestConfig)

				return res.data
			}
		}
	}
}
