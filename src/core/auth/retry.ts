import { isRetriable } from "./errors"

export type RetryOptions = {
	maxRetries: number
	retryDelay: number
}

export async function withRetry<T>(
	operation: () => Promise<T>,
	options: RetryOptions,
): Promise<T> {
	let attempt = 0

	// funny loop
	for (;;) {
		try {
			return await operation()
		} catch (error) {
			if (attempt >= options.maxRetries || !isRetriable(error)) {
				throw error
			}

			attempt += 1

			await new Promise((resolve) =>
				setTimeout(resolve, options.retryDelay * attempt),
			)
		}
	}
}

export default withRetry
