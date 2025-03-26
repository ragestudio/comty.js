import request from "../../../request"

export default async (id: String) => {
    const response = await request({
        method: "GET",
        url: `/music/playlists/${id}/data`,
    })

    // @ts-ignore
    return response.data
}