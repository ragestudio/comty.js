import React from "react"
import ChatsModel from "../../models/chats"

const ChatEvents = {
	"channel:message:new": async (ctx, data) => {
		console.log("channel:message:new", data)
		ctx.setTimeline((prev) => [...prev, data])
	},
	"channel:message:update": async (ctx, data) => {
		console.log("channel:message:update", data)
	},
	"channel:message:delete": async (ctx, data) => {
		console.log("channel:message:delete", data)
	},
	"channel:typing": async (ctx, data) => {
		console.log("channel:typing", data)

		ctx.setUsersTyping((prev) => {
			if (data.isTyping) {
				// check if the user is already typing
				// if not, add them to the list
				if (!prev.find((user) => user.id === data.user_id)) {
					return [...prev, { ...data.user }]
				}
			} else {
				// if the user is not typing, remove them
				return prev.filter((user) => user._id !== data.user_id)
			}
		})
	},
}

function useChannelChat(group_id, channel_id) {
	const wssocket = React.useRef(
		globalThis.__comty_shared_state.ws.sockets.get("chats"),
	)
	const oldestId = React.useRef(null)
	const typingTimeout = React.useRef(null)

	const [initialLoading, setInitialLoading] = React.useState(true)
	const [loading, setLoading] = React.useState(false)

	const [timeline, setTimeline] = React.useState([])
	const [usersTyping, setUsersTyping] = React.useState([])
	const [isTyping, setIsTyping] = React.useState(false)
	const [error, setError] = React.useState(null)

	function createEventHandler(handler) {
		return (...args) =>
			handler(
				{ setTimeline, setError, setLoading, setUsersTyping },
				...args,
			)
	}

	function typing(to = true) {
		setIsTyping(to)

		if (typingTimeout.current) {
			clearTimeout(typingTimeout.current)
		}

		// create a timeout to set the typing state to false automatically
		if (to === true) {
			typingTimeout.current = setTimeout(() => {
				setIsTyping(false)
			}, 5000)
		}
	}

	async function send({ message, attachments } = {}) {
		if (!message || message.length === 0) {
			return null
		}

		const data = {
			group_id: group_id,
			channel_id: channel_id,
			message: message,
			attachments: attachments,
		}

		const invokeStarts = performance.now()

		const result = await wssocket.current.call("channel:send", data)

		console.debug("send result", result, {
			tooksMs: Number((performance.now() - invokeStarts).toFixed(2)),
		})

		setIsTyping(false)

		return result
	}

	async function load() {
		setLoading(true)

		try {
			const data = await ChatsModel.channels.get(group_id, channel_id, {
				limit: 50,
				beforeId: oldestId.current,
			})

			if (data.items.length > 0) {
				const users = new Map(
					data.users.map((user) => [user._id, user]),
				)

				data.items = data.items.map((item) => {
					item.user = users.get(item.user_id)
					return item
				})

				// append messages to the top of the timeline
				setTimeline((prev) => [...data.items, ...prev])
				oldestId.current = data.items[0]._id
			}
		} catch (error) {
			console.error("Error loading historical messages:", error)
			setError(error)
		}

		setLoading(false)
	}

	React.useEffect(() => {
		if (!wssocket.current || initialLoading) {
			return undefined
		}

		wssocket.current
			.call("channel:typing", {
				isTyping: isTyping,
				group_id: group_id,
				channel_id: channel_id,
			})
			.catch((error) => {
				console.error("Error setting typing state:", error)
			})
	}, [isTyping])

	// initialize room
	React.useEffect(() => {
		if (!wssocket.current) {
			throw new Error("Chat websocket not available or found")
		}

		// set states
		setInitialLoading(true)
		setLoading(true)
		setTimeline([])
		setUsersTyping([])
		setIsTyping(false)
		setError(null)

		// load messages
		load()

		// register events
		for (const [event, handler] of Object.entries(ChatEvents)) {
			wssocket.current.on(event, createEventHandler(handler))
		}

		// join to subcriber
		wssocket.current.call("channel:subscribe", {
			group_id: group_id,
			channel_id: channel_id,
		})

		setInitialLoading(false)

		return () => {
			// unregister events
			for (const [event, handler] of Object.entries(ChatEvents)) {
				wssocket.current.off(event, createEventHandler(handler))
			}

			// unsubscribe
			wssocket.current.call("channel:unsubscribe", {
				group_id: group_id,
				channel_id: channel_id,
			})
		}
	}, [group_id, channel_id])

	return {
		initialLoading: initialLoading,
		timeline: timeline,
		loading: loading,
		error: error,
		load: load,
		send: send,
		typing: typing,
		isTyping: isTyping,
		usersTyping: usersTyping,
	}
}

export default useChannelChat
