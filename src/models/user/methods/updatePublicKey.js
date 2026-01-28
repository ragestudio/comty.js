import request from "../../../request"

export default async (public_key) => {
	const { data } = await request({
		method: "PUT",
		url: `/users/self/public-key`,
		data: {
			public_key: public_key,
		},
	})

	return data
}
