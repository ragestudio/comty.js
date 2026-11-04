export function isAuthEndpoint(url?: string) {
	if (!url) return false

	try {
		const { pathname } = new URL(url, "http://localhost")

		return pathname === "/auth" || pathname.startsWith("/auth/")
	} catch {
		return false
	}
}

export default isAuthEndpoint
