import type { AuthModel } from ".."

export type AuthRegisterPayloadType = {
	username: string
	password: string
	email: string
	tos: boolean
	captcha: string
}

export default async function (
	this: AuthModel,
	payload: AuthRegisterPayloadType,
): Promise<object> {
	const { username, password, email, tos, captcha } = payload

	let response = null

	try {
		response = await this.request({
			method: "post",
			url: "/register",
			data: {
				username: username,
				password: password,
				email: email,
				accept_tos: tos,
				captcha: captcha,
			},
		})

		if (!response) {
			throw new Error("Unable to register user")
		}

		return response.data
	} catch (error) {
		throw new Error("Unable to register user")
	}
}
