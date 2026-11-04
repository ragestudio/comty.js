import * as v from "valibot"

import { Validate } from "../../../core/endpoint/decorators/Validate"
import { Definition } from "../../../core/endpoint/decorators/Definition"

import BaseEndpoint from "../../../core/endpoint/BaseEndpoint"

class GroupRTC extends BaseEndpoint {
	/**
	 * Get the state of a group RTC
	 */
	@Validate(v.pipe(v.string(), v.minLength(1, "group_id is required")))
	@Definition((group_id) => ({
		method: "GET",
		url: `/rtc/groups/${group_id}/state`,
	}))
	getGroupState!: (group_id: string) => Promise<any>
}

export default new GroupRTC()
