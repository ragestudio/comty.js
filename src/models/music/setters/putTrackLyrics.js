import request from "../../../request"

export default async (track_id, data) => {
    const response = await request({
        method: "put",
        url: `/music/lyrics/${track_id}`,
        data: data,
    })

    // @ts-ignore
    return response.data
}