import request from "../../../request"

export default async (params) => {
    const response = await request({
        method: "GET",
        url: `/music/recently`,
        params: params,
    })

    return response.data
}