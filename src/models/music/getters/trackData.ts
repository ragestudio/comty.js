import request from "../../../request"

export default async (id: String, options: Object) => {
    const response = await request({
        method: "GET",
        url: `/music/tracks/${id}/data`,
        params: options
    })

    // @ts-ignore
    return response.data
}