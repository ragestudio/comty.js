import request from "../../../request"

export default async (code) => {
	const { data } = await request({
		method: "POST",
		url: "/users/self/mfa/enable",
		data: {
			code,
		},
	})

	return data
}
