import handleBeforeRequest from "./helpers/handleBeforeRequest"
import handleAfterRequest from "./helpers/handleAfterRequest"

export default async (
	request = {
		method: "GET",
	},
	...args
) => {
	const instance = request.instance ?? __comty_shared_state.baseRequest

	if (!instance) {
		throw new Error("No instance provided")
	}

	// handle before request
	await handleBeforeRequest(request)

	if (typeof request === "string") {
		request = {
			url: request,
		}
	}

	if (typeof request.headers !== "object") {
		request.headers = {}
	}

	let result = null
	let retryCount = 0
	const maxRetries = request.maxRetries ?? 3
	const retryDelay = request.retryDelay ?? 1000

	const makeRequest = async () => {
		const _result = await instance(request, ...args).catch((error) => {
			return error
		})

		result = _result
	}

	const attemptRequest = async () => {
		await makeRequest()

		// Check if we should retry
		if (result instanceof Error && retryCount < maxRetries) {
			retryCount++
			// Wait for retry delay before next attempt
			await new Promise((resolve) => setTimeout(resolve, retryDelay))
			await attemptRequest()
		}
	}

	await attemptRequest()

	// handle after request
	await handleAfterRequest(result, makeRequest)

	// if error, throw it
	if (result instanceof Error) {
		throw result
	}

	return result
}
