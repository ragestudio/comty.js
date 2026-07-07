import request from "../../../request"

type MetaGroup = {
	group_v: number
	total_members: number
	total_channels: number
}

export default async function (group_id: string): Promise<MetaGroup> {
	if (typeof group_id !== "string") {
		throw new Error("group_id is required to be a string")
	}

	const response = await request({
		method: "GET",
		url: `/groups/${group_id}/meta`,
	})

	return response.data as MetaGroup
}
