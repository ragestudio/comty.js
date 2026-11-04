export type RefreshSchedulerOptions = {
	autoRefresh: boolean
	refreshThreshold: number
	minRefreshDelay: number
	maxRefreshDelay: number
	retryDelay: number
	// token expiration in seconds, undefined when there is no token
	getExpiration: () => number | undefined
	refresh: () => Promise<void>
}

export class RefreshScheduler {
	private timer?: ReturnType<typeof setTimeout>
	private retries = 0

	constructor(private options: RefreshSchedulerOptions) {}

	// true when the token is expired or about to expire
	shouldRefresh(): boolean {
		const expiration = this.options.getExpiration()

		if (!expiration) return false

		return (
			expiration * 1000 - Date.now() <=
			this.options.refreshThreshold * 1000
		)
	}

	clear() {
		if (this.timer) {
			clearTimeout(this.timer)
			this.timer = undefined
		}
	}

	// forget the transient failures counter
	reset() {
		this.retries = 0
	}

	// schedule a refresh right before the token expires
	schedule() {
		this.clear()

		if (!this.options.autoRefresh) return

		const expiration = this.options.getExpiration()

		if (!expiration) return

		const delay = Math.max(
			expiration * 1000 -
				Date.now() -
				this.options.refreshThreshold * 1000,
			this.options.minRefreshDelay,
		)

		this.timer = setTimeout(() => {
			this.options.refresh().catch(() => {})
		}, delay)

		this.unref(this.timer)
	}

	// backoff retry for transient refresh failures
	scheduleRetry() {
		this.clear()

		if (!this.options.autoRefresh) return

		this.retries += 1

		const delay = Math.min(
			this.options.retryDelay * 2 ** (this.retries - 1),
			this.options.maxRefreshDelay,
		)

		this.timer = setTimeout(() => {
			this.options.refresh().catch(() => {})
		}, delay)

		this.unref(this.timer)
	}

	async wake() {
		if (this.shouldRefresh()) {
			await this.options.refresh().catch(() => {})
		} else {
			this.schedule()
		}
	}

	private unref(timer: ReturnType<typeof setTimeout>) {
		;(timer as any)?.unref?.()
	}
}

export default RefreshScheduler
