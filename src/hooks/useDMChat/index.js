import React from "react"
import ChatsModel from "../../models/chats"

function setUsersOnMessages(data) {
	const users = new Map(data.users.map((user) => [user._id, user]))

	data.items = data.items.map((item) => {
		item.user = users.get(item.user_id) ?? {
			username: "unknown",
			public_name: "Ghost",
			unknown: true,
		}

		return item
	})

	return data
}

const ChatEvents = {
	"channel:message": async (ctx, data) => {
		console.debug("dm:message:new", data)

		if (!ctx.pausedUpdates.current) {
			ctx.setTimeline((prev) => [data, ...prev])
			ctx.newestId.current = data._id
		}

		if (ctx.events) {
			if (typeof ctx.events.onNewMessage === "function") {
				await ctx.events.onNewMessage(data)
			}
		}
	},
	"channel:message:updated": async (ctx, data) => {
		console.debug("dm:message:updated", data)

		if (ctx.events) {
			if (typeof ctx.events.onUpdatedMessage === "function") {
				await ctx.events.onUpdatedMessage(data)
			}
		}
	},
	"channel:message:deleted": async (ctx, data) => {
		console.debug("dm:message:deleted", data)

		ctx.setTimeline((prev) =>
			prev.filter((message) => message._id !== data._id),
		)

		if (ctx.events) {
			if (typeof ctx.events.onDeletedMessage === "function") {
				await ctx.events.onDeletedMessage(data)
			}
		}
	},
	"channel:typing": async (ctx, data) => {
		console.debug("dm:typing", data)

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

function useDmChat(to_user_id, events) {
	const wssocket = React.useRef(
		globalThis.__comty_shared_state.ws.sockets.get("main"),
	)
	const oldestId = React.useRef(null)
	const newestId = React.useRef(null)
	const typingTimeout = React.useRef(null)
	const pausedUpdates = React.useRef(false)

	const [initialLoading, setInitialLoading] = React.useState(true)
	const [loading, setLoading] = React.useState(false)

	const [hasMore, setHasMore] = React.useState(true)
	const [timeline, setTimeline] = React.useState([])
	const [usersTyping, setUsersTyping] = React.useState([])
	const [isTyping, setIsTyping] = React.useState(false)
	const [error, setError] = React.useState(null)

	function createEventHandler(handler) {
		return (...args) =>
			handler(
				{
					setTimeline,
					setError,
					setLoading,
					setUsersTyping,
					oldestId,
					newestId,
					events,
					pausedUpdates,
				},
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

	async function send({ message, attachments = [], sticker } = {}) {
		if (
			(!message || message.length === 0) &&
			attachments.length === 0 &&
			!sticker
		) {
			return null
		}

		if (Array.isArray(attachments)) {
			attachments = attachments.map((attachment) => {
				if (typeof attachment === "string") {
					return {
						url: attachment,
					}
				}

				return {
					url: attachment.url,
					hash: attachment.hash,
				}
			})
		}

		const data = {
			to_user_id: to_user_id,
			message: message,
			attachments: attachments,
			sticker: sticker,
		}

		const invokeStarts = performance.now()

		await wssocket.current.call("dm:send", data)

		console.debug("send result", {
			tooksMs: Number((performance.now() - invokeStarts).toFixed(2)),
		})

		setIsTyping(false)

		return true
	}

	async function load({ beforeId, afterId } = {}) {
		setLoading(true)

		if (afterId && beforeId) {
			throw new Error("Only one of beforeId or afterId can be provided")
		}

		try {
			let data = await ChatsModel.dm.get(to_user_id, {
				limit: 50,
				beforeId: beforeId,
				afterId: afterId,
			})

			if (data.items.length > 0) {
				setHasMore(true)

				data = setUsersOnMessages(data)

				if (afterId) {
					setTimeline((prev) => [...data.items, ...prev])
				} else {
					setTimeline((prev) => [...prev, ...data.items])
				}
			} else {
				setHasMore(false)
			}
		} catch (error) {
			console.error("Error loading historical messages:", error)
			setError(error)
		}

		setLoading(false)
	}

	const loadBefore = React.useCallback(
		async (message_id) => {
			await load({
				beforeId: message_id ?? oldestId.current,
			})
		},
		[to_user_id],
	)

	const loadAfter = React.useCallback(
		async (message_id) => {
			await load({
				afterId: message_id ?? newestId.current,
			})
		},
		[to_user_id],
	)

	const setPausedUpdates = React.useCallback((to) => {
		pausedUpdates.current = to
	}, [])

	const initializeRoom = React.useCallback(async () => {
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
		oldestId.current = null
		newestId.current = null

		// register events
		for (const [event, handler] of Object.entries(ChatEvents)) {
			wssocket.current.on(event, createEventHandler(handler))
		}

		// join to subcriber
		wssocket.current.call("dm:subscribe", {
			to_user_id: to_user_id,
		})

		// load messages
		await load()

		setInitialLoading(false)

		return
	}, [to_user_id])

	React.useEffect(() => {
		if (timeline.length > 0) {
			oldestId.current = timeline[timeline.length - 1]._id
			newestId.current = timeline[0]._id
		}
	}, [timeline])

	// handle typing state
	React.useEffect(() => {
		if (!wssocket.current || initialLoading) {
			return undefined
		}

		wssocket.current
			.call("dm:typing", {
				isTyping: isTyping,
				to_user_id: to_user_id,
			})
			.catch((error) => {
				console.error("Error setting typing state:", error)
			})
	}, [isTyping])

	// handle room initialization
	React.useEffect(() => {
		initializeRoom()

		return () => {
			if (!wssocket.current) {
				return undefined
			}

			// unregister events
			for (const [event, handler] of Object.entries(ChatEvents)) {
				wssocket.current.off(event, createEventHandler(handler))
			}

			// unsubscribe
			wssocket.current.call("dm:unsubscribe", {
				to_user_id: to_user_id,
			})
		}
	}, [to_user_id])

	return {
		initialLoading: initialLoading,
		timeline: timeline,
		loading: loading,
		error: error,
		loadBefore: loadBefore,
		loadAfter: loadAfter,
		load: load,
		send: send,
		typing: typing,
		isTyping: isTyping,
		usersTyping: usersTyping,
		pausedUpdates: pausedUpdates.current,
		setPausedUpdates: setPausedUpdates,
		hasMore: hasMore,
		setHasMore: setHasMore,
	}
}

export default useDmChat
