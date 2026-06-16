import request from "../../../request"

export default async () => {
	const { data } = await request({
		method: "GET",
		url: "/users/self/mfa/generate",
	})

	return data
}
