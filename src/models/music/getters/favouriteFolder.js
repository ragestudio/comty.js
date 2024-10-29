import request from "../../../request"

export default async ({ limit = 100, offset = 0 } = {}) => {
    const response = await request({
        method: "GET",
        url: "/music/my/folder",
        params: {
            limit: limit,
            offset: offset
        }
    })

    return response.data
}