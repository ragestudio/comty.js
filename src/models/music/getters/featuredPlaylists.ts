import request from "../../../request"

export default async () => {
    const response = await request({
        method: "GET",
        url: "/music/playlists/featured",
    })

    // @ts-ignore
    return response.data
}