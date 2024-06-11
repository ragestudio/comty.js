import request from "../../../request"

type Arguments = {
    limit: Number
    offset: Number
    keywords: String
}

export default async ({
    limit,
    offset,
    keywords,
}: Arguments) => {
    const response = await request({
        method: "GET",
        url: "/music/releases/self",
        params: {
            limit: limit,
            offset: offset,
            keywords: keywords,
        }
    })

    // @ts-ignore
    return response.data
}