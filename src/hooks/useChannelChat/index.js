import useChat from "../useChat"

function useChannelChat(group_id, channel_id, events) {
	return useChat("channel", { group_id, channel_id }, events)
}

export default useChannelChat
