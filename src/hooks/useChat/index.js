import React from "react"
import ChatsModel from "../../models/chats"
import userDataMap from "../../utils/usersDataMap"

const CHAT_CONFIGS = {
	channel: {
		events: {
			message: "channel:message",
			messageUpdated: "channel:message:updated",
			messageDeleted: "channel:message:deleted",
			typing: "channel:typing",
		},
		methods: {
			send: "channel:send",
			subscribe: "channel:subscribe",
			unsubscribe: "channel:unsubscribe",
			typing: "channel:typing",
		},
		model: {
			get: (params, options) =>
				ChatsModel.channels.get(
					params.group_id,
					params.channel_id,
					options,
				),
		},
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
		events: {
			message: "channel:message",
			messageUpdated: "channel:message:updated",
			messageDeleted: "channel:message:deleted",
			typing: "channel:typing",
		},
		methods: {
			send: "dm:send",
			subscribe: "dm:subscribe",
			unsubscribe: "dm:unsubscribe",
			typing: "dm:typing",
		},
		model: {
			get: (params, options) =>
				ChatsModel.dm.get(params.to_user_id, options),
		},
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

const getSocket = () =>
	globalThis.__comty_shared_state?.ws?.sockets?.get("main")

function useChat(type, params, events) {
	const config = CHAT_CONFIGS[type]

	if (!config) {
		throw new Error(`Invalid chat type: ${type}. Must be 'channel' or 'dm'`)
	}

	const depKey =
		type === "channel"
			? `${type}:${params.group_id}:${params.channel_id}`
			: `${type}:${params.to_user_id}`

	const paramsRef = React.useRef(params)
	const eventsRef = React.useRef(events)
	const pausedUpdatesRef = React.useRef(false)
	const typingTimeout = React.useRef(null)
	const isTypingNetworkState = React.useRef(false)
	const oldestId = React.useRef(null)
	const newestId = React.useRef(null)

	const [initialLoading, setInitialLoading] = React.useState(true)
	const [loading, setLoading] = React.useState(false)
	const [hasMore, setHasMore] = React.useState(true)
	const [timeline, setTimeline] = React.useState([])
	const [usersTyping, setUsersTyping] = React.useState([])
	const [isTyping, setIsTyping] = React.useState(false)
	const [error, setError] = React.useState(null)

	React.useEffect(() => {
		paramsRef.current = params
		eventsRef.current = events
	}, [params, events])

	React.useEffect(() => {
		if (timeline.length > 0) {
			oldestId.current = timeline[timeline.length - 1]._id
			newestId.current = timeline[0]._id
		}
	}, [timeline])

	const handleNewMessage = React.useCallback((data) => {
		if (!pausedUpdatesRef.current) setTimeline((prev) => [data, ...prev])
		eventsRef.current?.onNewMessage?.(data)
	}, [])

	const handleMessageUpdated = React.useCallback((data) => {
		eventsRef.current?.onUpdatedMessage?.(data)
	}, [])

	const handleMessageDeleted = React.useCallback((data) => {
		setTimeline((prev) => prev.filter((msg) => msg._id !== data._id))
		eventsRef.current?.onDeletedMessage?.(data)
	}, [])

	const handleTypingEvent = React.useCallback((data) => {
		setUsersTyping((prev) => {
			const userId = data.user_id || data.user?.id || data.user?._id

			if (data.isTyping) {
				const isExisting = prev.some(
					(u) => u.id === userId || u._id === userId,
				)

				return isExisting
					? prev
					: [...prev, { id: userId, ...data.user }]
			}

			return prev.filter((u) => u.id !== userId && u._id !== userId)
		})
	}, [])

	const typing = React.useCallback(
		(isTypingNow = true) => {
			setIsTyping(isTypingNow)

			if (typingTimeout.current) {
				clearTimeout(typingTimeout.current)
			}

			if (isTypingNetworkState.current !== isTypingNow) {
				isTypingNetworkState.current = isTypingNow

				getSocket()
					?.call(
						config.methods.typing,
						config.params.typing(paramsRef.current, isTypingNow),
					)
					.catch((err) =>
						console.error("Error setting typing state:", err),
					)
			}

			if (isTypingNow) {
				typingTimeout.current = setTimeout(() => typing(false), 5000)
			}
		},
		[config],
	)

	const send = React.useCallback(
		async ({ message, attachments = [], sticker } = {}) => {
			if (!message && attachments.length === 0 && !sticker) {
				return null
			}

			const formattedAttachments = attachments.map((att) =>
				typeof att === "string"
					? { url: att }
					: { url: att.url, hash: att.hash },
			)

			const data = config.params.send(paramsRef.current, {
				message,
				attachments: formattedAttachments,
				sticker,
			})

			await getSocket()?.call(config.methods.send, data)
			typing(false)

			return true
		},
		[config, typing],
	)

	const load = React.useCallback(
		async ({ beforeId, afterId } = {}) => {
			if (afterId && beforeId) {
				throw new Error(
					"Only one of beforeId or afterId can be provided",
				)
			}

			setLoading(true)

			try {
				const data = await config.model.get(paramsRef.current, {
					limit: 30,
					beforeId,
					afterId,
				})

				if (data.items.length > 0) {
					setHasMore(true)

					const mappedData = userDataMap(data)

					setTimeline((prev) =>
						afterId
							? [...mappedData.items, ...prev]
							: [...prev, ...mappedData.items],
					)
				} else {
					setHasMore(false)
				}
			} catch (err) {
				console.error("Error loading historical messages:", err)
				setError(err)
			} finally {
				setLoading(false)
			}
		},
		[config],
	)

	const loadBefore = React.useCallback(
		(id) => load({ beforeId: id ?? oldestId.current }),
		[load],
	)
	const loadAfter = React.useCallback(
		(id) => load({ afterId: id ?? newestId.current }),
		[load],
	)
	const setPausedUpdates = React.useCallback((to) => {
		pausedUpdatesRef.current = to
	}, [])

	React.useEffect(() => {
		const socket = getSocket()
		let isMounted = true

		if (!socket) {
			setError(new Error("Chat websocket not available or found"))
			return
		}

		setInitialLoading(true)
		setLoading(true)
		setTimeline([])
		setUsersTyping([])
		setIsTyping(false)
		isTypingNetworkState.current = false
		setError(null)
		setHasMore(true)

		const currentParams = paramsRef.current
		const subscribeParams = config.params.subscribe(currentParams)

		socket.on(config.events.message, handleNewMessage)
		socket.on(config.events.messageUpdated, handleMessageUpdated)
		socket.on(config.events.messageDeleted, handleMessageDeleted)
		socket.on(config.events.typing, handleTypingEvent)

		socket
			.call(config.methods.subscribe, subscribeParams)
			.catch(console.error)

		config.model
			.get(currentParams, { limit: 50 })
			.then((data) => {
				if (!isMounted) {
					return
				}

				setHasMore(data.items.length > 0)

				if (data.items.length > 0) {
					setTimeline(userDataMap(data).items)
				}
			})
			.catch((err) => {
				if (!isMounted) {
					return
				}

				setError(err)
			})
			.finally(() => {
				if (!isMounted) {
					return
				}

				setLoading(false)
				setInitialLoading(false)
			})

		return () => {
			isMounted = false

			socket.off(config.events.message, handleNewMessage)
			socket.off(config.events.messageUpdated, handleMessageUpdated)
			socket.off(config.events.messageDeleted, handleMessageDeleted)
			socket.off(config.events.typing, handleTypingEvent)

			socket
				.call(config.methods.unsubscribe, subscribeParams)
				.catch(console.error)
		}
	}, [
		depKey,
		config,
		handleNewMessage,
		handleMessageUpdated,
		handleMessageDeleted,
		handleTypingEvent,
	])

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
		pausedUpdates: pausedUpdatesRef.current,
		setPausedUpdates,
		hasMore,
		setHasMore,
	}
}

export default useChat
