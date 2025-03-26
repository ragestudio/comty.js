import request from "../../../request"

const typeToNamespace = {
    track: "tracks",
    //playlist: "playlists",
    //release: "releases",
}

export default async (type, track_id, to) => {
    if (!type) {
        throw new Error("type is required")
    }

    if (!track_id) {
        throw new Error("track_id is required")
    }

    type = type.toLowerCase()

    type = typeToNamespace[type]

    if (!type) {
        throw new Error(`Unsupported type: ${type}`)
    }

    const response = await request({
        method: "post",
        url: `/music/${type}/${track_id}/favourite`,
        data: {
            to: to,
        }
    })

    // @ts-ignore
    return response.data
}