import type { AuthModel } from ".."

import client from "../../../core/client"

export default async function (
	this: AuthModel,
	{ confirm = false }: { confirm?: boolean } = {},
) {
	if (!confirm) {
		console.error(
			"In order to disable your account, you must confirm the action.",
		)
		return null
	}

	const response = await this.request({
		method: "post",
		url: "/auth/disable-account",
	})

	client.eventBus.emit("auth:disabled_account")

	return response.data
}
