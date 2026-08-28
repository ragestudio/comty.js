import type { AuthModel } from ".."

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

	__comty_shared_state.eventBus.emit("auth:disabled_account")

	return response.data
}
