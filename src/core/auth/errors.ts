// transient errors
export function isRetriable(error: any): boolean {
	const status = error?.response?.status

	if (status >= 400 && status < 500) return false
	if (error?.code === "ERR_CANCELED") return false

	return true
}

// real auth failures
export function isAuthError(error: any): boolean {
	const status = error?.response?.status

	return status === 401 || status === 403
}

export function errorMessage(error: unknown): string {
	if (error instanceof Error) return error.message

	return String(error ?? "unknown error")
}
