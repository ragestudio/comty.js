import request from "../../../request"

export default async (track) => {
    const response = await request({
        method: "PUT",
        url: "/music/tracks",
        data: track,
    })

    // @ts-ignore
    return response.data
}