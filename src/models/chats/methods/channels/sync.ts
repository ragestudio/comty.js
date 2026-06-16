import request from "../../../../request"

type SyncParams = {
	last_synced_at?: number | string
	last_message_id?: number | string
}

export default async (
	group_id: string,
	channel_id: string,
	params?: SyncParams,
) => {
	if (typeof group_id !== "string") {
		throw new Error("group_id must be a string")
	}

	if (typeof channel_id !== "string") {
		throw new Error("channel_id must be a string")
	}

	const response = await request({
		method: "GET",
		url: `/chats/channels/${group_id}/${channel_id}/sync`,
		params: params,
	})

	return response.data
}
