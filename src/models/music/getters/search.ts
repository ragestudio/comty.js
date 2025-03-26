import request from "../../../request"

type Arguments = {
    keywords: String
    limit: Number
    offset: Number
}

export default async ({
    keywords,
    limit,
    offset,
}: Arguments) => {
    const response = await request({
        method: "GET",
        url: "/music/search",
        params: {
            keywords: keywords,
            limit: limit,
            offset: offset,
        }
    })

    // @ts-ignore
    return response.data
}