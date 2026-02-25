import useChat from "../useChat"

function useDMChat(to_user_id, events) {
	return useChat("dm", { to_user_id }, events)
}

export default useDMChat
