import React from "react"
import ChatsModel from "../../models/chats"
import userDataMap from "../../utils/usersDataMap"

// chat type configurations
const CHAT_CONFIGS = {
	channel: {
		// event names
		events: {
			message: "channel:message",
			messageUpdated: "channel:message:updated",
			messageDeleted: "channel:message:deleted",
			typing: "channel:typing",
		},
		// socket methods
		methods: {
			send: "channel:send",
			subscribe: "channel:subscribe",
			unsubscribe: "channel:unsubscribe",
			typing: "channel:typing",
		},
		// model methods
		model: {
			get: (params, options) =>
				ChatsModel.channels.get(
					params.group_id,
					params.channel_id,
					options,
				),
		},
		// parameter builders
		params: {
			send: (params, data) => ({
				group_id: params.group_id,
				channel_id: params.channel_id,
				...data,
			}),
			subscribe: (params) => ({
				group_id: params.group_id,
				channel_id: params.channel_id,
			}),
			unsubscribe: (params) => ({
				group_id: params.group_id,
				channel_id: params.channel_id,
			}),
			typing: (params, isTyping) => ({
				isTyping,
				group_id: params.group_id,
				channel_id: params.channel_id,
			}),
		},
	},
	dm: {
		// event names
		events: {
			message: "channel:message",
			messageUpdated: "channel:message:updated",
			messageDeleted: "channel:message:deleted",
			typing: "channel:typing",
		},
		// socket methods
		methods: {
			send: "dm:send",
			subscribe: "dm:subscribe",
			unsubscribe: "dm:unsubscribe",
			typing: "dm:typing",
		},
		// model methods
		model: {
			get: (params, options) =>
				ChatsModel.dm.get(params.to_user_id, options),
		},
		// parameter builders
		params: {
			send: (params, data) => ({
				to_user_id: params.to_user_id,
				...data,
			}),
			subscribe: (params) => ({
				to_user_id: params.to_user_id,
			}),
			unsubscribe: (params) => ({
				to_user_id: params.to_user_id,
			}),
			typing: (params, isTyping) => ({
				isTyping,
				to_user_id: params.to_user_id,
			}),
		},
	},
}

// event handlers - same for both channel and dm (events have same names)
const ChatEvents = {
	"channel:message": async (ctx, data) => {
		console.debug(`${ctx.configType}:message:new`, data)

		if (!ctx.pausedUpdates.current) {
			ctx.setTimeline((prev) => [data, ...prev])
			ctx.newestId.current = data._id
		}

		if (ctx.events?.onNewMessage) {
			await ctx.events.onNewMessage(data)
		}
	},
	"channel:message:updated": async (ctx, data) => {
		console.debug(`${ctx.configType}:message:updated`, data)

		if (ctx.events?.onUpdatedMessage) {
			await ctx.events.onUpdatedMessage(data)
		}
	},
	"channel:message:deleted": async (ctx, data) => {
		console.debug(`${ctx.configType}:message:deleted`, data)

		ctx.setTimeline((prev) =>
			prev.filter((message) => message._id !== data._id),
		)

		if (ctx.events?.onDeletedMessage) {
			await ctx.events.onDeletedMessage(data)
		}
	},
	"channel:typing": async (ctx, data) => {
		console.debug(`${ctx.configType}:typing`, data)

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
			return prev
		})
	},
}

function useChat(type, params, events) {
	const config = CHAT_CONFIGS[type]

	if (!config) {
		throw new Error(`Invalid chat type: ${type}. Must be 'channel' or 'dm'`)
	}

	// extract key values for stable dependencies
	const depKey = React.useMemo(() => {
		if (type === "channel") {
			return `${type}:${params.group_id}:${params.channel_id}`
		} else {
			return `${type}:${params.to_user_id}`
		}
	}, [
		type,
		type === "channel" ? params.group_id : params.to_user_id,
		type === "channel" ? params.channel_id : null,
	])

	const wssocket = React.useRef(
		globalThis.__comty_shared_state.ws.sockets.get("main"),
	)
	const oldestId = React.useRef(null)
	const newestId = React.useRef(null)
	const typingTimeout = React.useRef(null)
	const pausedUpdates = React.useRef(false)
	const eventHandlers = React.useRef({})

	const [initialLoading, setInitialLoading] = React.useState(true)
	const [loading, setLoading] = React.useState(false)
	const [hasMore, setHasMore] = React.useState(true)
	const [timeline, setTimeline] = React.useState([])
	const [usersTyping, setUsersTyping] = React.useState([])
	const [isTyping, setIsTyping] = React.useState(false)
	const [error, setError] = React.useState(null)

	// create event handler factory
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
					configType: type,
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

		const data = config.params.send(params, {
			message,
			attachments,
			sticker,
		})

		const invokeStarts = performance.now()

		await wssocket.current.call(config.methods.send, data)

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
			let data = await config.model.get(params, {
				limit: 50,
				beforeId,
				afterId,
			})

			if (data.items.length > 0) {
				setHasMore(true)

				data = userDataMap(data)

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
		[depKey],
	)

	const loadAfter = React.useCallback(
		async (message_id) => {
			await load({
				afterId: message_id ?? newestId.current,
			})
		},
		[depKey],
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
			const eventHandler = createEventHandler(handler)
			eventHandlers.current[event] = eventHandler
			wssocket.current.on(event, eventHandler)
		}

		// join to subscriber
		wssocket.current.call(
			config.methods.subscribe,
			config.params.subscribe(params),
		)

		// load initial messages
		setLoading(true)
		try {
			let data = await config.model.get(params, {
				limit: 50,
			})

			if (data.items.length > 0) {
				setHasMore(true)
				data = userDataMap(data)
				setTimeline(data.items)
			} else {
				setHasMore(false)
			}
		} catch (error) {
			console.error("Error loading historical messages:", error)
			setError(error)
		}

		setLoading(false)
		setInitialLoading(false)

		return
	}, [depKey])

	// update oldest and newest IDs when timeline changes
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
			.call(config.methods.typing, config.params.typing(params, isTyping))
			.catch((error) => {
				console.error("Error setting typing state:", error)
			})
	}, [isTyping, depKey, initialLoading])

	// handle room initialization and cleanup
	React.useEffect(() => {
		initializeRoom()

		return () => {
			if (!wssocket.current) {
				return undefined
			}

			// unregister events
			for (const [event, handler] of Object.entries(
				eventHandlers.current,
			)) {
				wssocket.current.off(event, handler)
			}
			eventHandlers.current = {}

			// unsubscribe
			wssocket.current.call(
				config.methods.unsubscribe,
				config.params.unsubscribe(params),
			)
		}
	}, [depKey])

	// cleanup typing timeout on unmount
	React.useEffect(() => {
		return () => {
			if (typingTimeout.current) {
				clearTimeout(typingTimeout.current)
			}
		}
	}, [])

	return {
		initialLoading,
		timeline,
		loading,
		error,
		loadBefore,
		loadAfter,
		load,
		send,
		typing,
		isTyping,
		usersTyping,
		pausedUpdates: pausedUpdates.current,
		setPausedUpdates,
		hasMore,
		setHasMore,
	}
}

export default useChat
