import request from "../../../request"

type Arguments = {
    keywords: String
    user_id: String
    limit: Number
    offset: Number
}

export default async ({
    keywords,
    user_id,
    limit,
    offset,
}: Arguments) => {
    const response = await request({
        method: "GET",
        url: "/music/playlists",
        params: {
            keywords: keywords,
            user_id: user_id,
            limit: limit,
            offset: offset,
        }
    })

    // @ts-ignore
    return response.data
}