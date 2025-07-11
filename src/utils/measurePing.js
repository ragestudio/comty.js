import request from "../request"

const fetchers = {
	http: () =>
		new Promise(async (resolve) => {
			const start = Date.now()

			const failTimeout = setTimeout(() => {
				resolve("timeout")
			}, 5000)

			request({
				method: "GET",
				url: "/ping",
			})
				.then(() => {
					clearTimeout(failTimeout)
					resolve(Date.now() - start)
				})
				.catch((err) => {
					console.log(err)
					clearTimeout(failTimeout)
					resolve("failed")
				})
		}),
	ws: () =>
		new Promise((resolve) => {
			const start = Date.now()

			const failTimeout = setTimeout(() => {
				resolve("failed")
			}, 5000)

			const sockets = globalThis.__comty_shared_state.ws.sockets
			let firstSocket = sockets.keys().next().value

			firstSocket = sockets.get(firstSocket)

			firstSocket.once("pong", () => {
				failTimeout && clearTimeout(failTimeout)

				resolve(Date.now() - start)
			})

			firstSocket.emit("ping")
		}),
}

export default async ({ select } = {}) => {
	let selectedPromises = []

	if (Array.isArray(select)) {
		select.forEach((item) => {
			if (!fetchers[item]) {
				return
			}
			selectedPromises.push(fetchers[item]())
		})
	} else {
		selectedPromises = [fetchers["http"](), fetchers["ws"]()]
	}

	const result = await Promise.all(selectedPromises)

	return result
}
