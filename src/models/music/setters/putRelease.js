import request from "../../../request"

export default async (release) => {
    const response = await request({
        method: "PUT",
        url: "/music/releases",
        data: release,
    })

    // @ts-ignore
    return response.data
}