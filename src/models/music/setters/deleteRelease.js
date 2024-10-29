import request from "../../../request"

export default async (release_id) => {
    const response = await request({
        method: "delete",
        url: `/music/releases/${release_id}`,
    })

    // @ts-ignore
    return response.data
}