import request from "../../../request"

export default async (code) => {
	const { data } = await request({
		method: "DELETE",
		url: "/users/self/mfa",
		data: {
			code,
		},
	})

	return data
}
