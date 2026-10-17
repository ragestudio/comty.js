import type { User } from "@comty/shared/types/user"
import type { DecodedAuthToken } from "@comty/shared/types/session"

import { jwtDecode } from "jwt-decode"
import EventEmitter from "@foxify/events"

import client from "../client"
import session from "../session"

import { authStore, initialAuthState, type AuthState } from "./store"
import { resolveAuthOptions, type ResolvedAuthOptions } from "./config"
import { RefreshScheduler } from "./RefreshScheduler"
import { errorMessage, isAuthError } from "./errors"
import { withRetry } from "./retry"

import type {
	AuthEventMap,
	AuthManagerOptions,
	AuthResponse,
	LoginPayload,
} from "./types"
import { AUTH_EVENT_NAMES } from "./types"

export class AuthManager extends EventEmitter<AuthEventMap> {
	readonly store = authStore

	private options: ResolvedAuthOptions
	private scheduler: RefreshScheduler

	private refreshPromise?: Promise<void> | null
	private startPromise?: Promise<boolean> | null

	constructor(options: AuthManagerOptions = {}) {
		super()

		this.options = resolveAuthOptions(options)

		for (const event of AUTH_EVENT_NAMES) {
			this.on(event, (...args: any[]) => {
				this.options.eventBus.emit(event, ...args)
			})
		}

		this.scheduler = new RefreshScheduler({
			autoRefresh: this.options.autoRefresh,
			refreshThreshold: this.options.refreshThreshold,
			minRefreshDelay: this.options.minRefreshDelay,
			maxRefreshDelay: this.options.maxRefreshDelay,
			retryDelay: this.options.retryDelay,
			getExpiration: () => session.tokenExpiration,
			refresh: () => this.refresh(),
		})

		client.registerAuthPlugin({
			ensureFreshToken: () => this.ensureFreshToken(),
			onUnauthorized: () => this.handleUnauthorized(),
		})
	}

	get state(): AuthState {
		return this.store.getState()
	}

	get token() {
		return session.token
	}

	get refreshToken() {
		return session.refreshToken
	}

	get user() {
		return this.store.getState().user
	}

	get authenticated() {
		return this.store.getState().authenticated
	}

	subscribe(listener: (state: AuthState) => void) {
		return this.store.subscribe(listener)
	}

	decode(token = session.token): DecodedAuthToken | null {
		if (!token) return null

		try {
			return jwtDecode<DecodedAuthToken>(token)
		} catch {
			return null
		}
	}

	start(): Promise<boolean> {
		if (this.startPromise) return this.startPromise

		this.startPromise = this.performStart().finally(() => {
			this.startPromise = null
		})

		return this.startPromise
	}

	stop() {
		this.scheduler.clear()
	}

	async adopt(): Promise<boolean> {
		if (!session.token) return false

		this.applySession()

		try {
			await this.loadUser()
		} catch (error) {
			this.options.logger.warn("failed to load user", error)
		}

		this.scheduler.schedule()

		this.store.setState({
			status: "authenticated",
			authenticated: true,
			initialized: true,
			error: null,
		})

		return true
	}

	async wake(): Promise<void> {
		if (!session.token) return

		await this.scheduler.wake()
	}

	async login(payload: LoginPayload): Promise<AuthResponse> {
		this.store.setState({ status: "authenticating", error: null })

		let data: AuthResponse

		try {
			data = await this.transport().login(payload)
		} catch (error) {
			this.store.setState({ status: "unauthenticated" })
			throw error
		}

		if (data?.mfa_required) {
			this.store.setState({ status: "unauthenticated" })
			this.emit("auth:mfa_required", data)
			return data
		}

		if (data?.activation_required) {
			this.store.setState({ status: "unauthenticated" })
			this.emit("auth:activation_required", data)
			return data
		}

		if (!data?.token) {
			this.store.setState({ status: "unauthenticated" })
			throw new Error("Invalid login response, no token received")
		}

		this.applySession(data.token, data.refreshToken)

		try {
			await this.loadUser()
		} catch (error) {
			this.options.logger.warn("failed to load user after login", error)
		}

		this.scheduler.schedule()

		this.store.setState({
			status: "authenticated",
			authenticated: true,
			initialized: true,
			error: null,
		})

		this.emit("auth:login_success", data)

		return data
	}

	async logout(): Promise<void> {
		this.scheduler.clear()

		try {
			await this.transport().logout()
		} catch (error) {
			this.options.logger.warn(
				"failed to destroy the remote session",
				error,
			)
		} finally {
			session.deleteToken()
			session.deleteRefreshToken()
			session.user = {}
		}

		this.store.setState({
			...initialAuthState,
			status: "unauthenticated",
			initialized: true,
		})

		this.emit("auth:logout_success")
	}

	refresh(): Promise<void> {
		if (this.refreshPromise) return this.refreshPromise

		this.refreshPromise = this.performRefresh().finally(() => {
			this.refreshPromise = null
		})

		return this.refreshPromise
	}

	async ensureFreshToken(): Promise<string | undefined> {
		if (!session.token) return undefined

		if (this.scheduler.shouldRefresh()) {
			await this.refresh()
		}

		return session.token
	}

	async handleUnauthorized(): Promise<boolean> {
		try {
			await this.refresh()
			return true
		} catch {
			return false
		}
	}

	private transport() {
		return this.options.transport
	}

	private retry<T>(operation: () => Promise<T>) {
		return withRetry(operation, {
			maxRetries: this.options.maxRetries,
			retryDelay: this.options.retryDelay,
		})
	}

	private async performStart(): Promise<boolean> {
		this.store.setState({ status: "restoring", error: null })

		await session.restore()

		if (!session.token) {
			this.store.setState({
				status: "unauthenticated",
				initialized: true,
				authenticated: false,
			})
			return false
		}

		this.applySession()

		if (this.scheduler.shouldRefresh()) {
			try {
				await this.refresh()
			} catch {
				// refresh already reported the failure
			}
		}

		if (this.store.getState().status === "invalid") return false
		if (!session.token) return false

		try {
			await this.loadUser()
		} catch (error) {
			this.options.logger.error("failed to load user", error)
			this.store.setState({ error: errorMessage(error) })
		}

		this.scheduler.schedule()

		this.store.setState({
			status: "authenticated",
			authenticated: true,
			initialized: true,
			error: null,
		})

		this.emit("auth:ready")

		return true
	}

	private async performRefresh(): Promise<void> {
		const token = session.token
		const refreshToken = session.refreshToken

		if (!token || !refreshToken) {
			throw this.invalidate(
				"Cannot refresh without a token and refresh token",
			)
		}

		this.store.setState({ status: "refreshing", refreshing: true })
		this.emit("session:refreshing")

		try {
			const data = await this.retry(() =>
				this.transport().refresh(token, refreshToken),
			)

			if (!data?.token) {
				throw new Error("Invalid refresh response, no token received")
			}

			this.applySession(data.token, data.refreshToken)
			this.scheduler.reset()

			this.store.setState({
				status: "authenticated",
				refreshing: false,
				authenticated: true,
				error: null,
				last_refresh: Date.now(),
			})

			this.scheduler.schedule()
			this.emit("session:refreshed", data)
		} catch (error) {
			this.store.setState({ refreshing: false })

			// only drop the session on real auth failures, keep it on network issues
			if (isAuthError(error)) {
				throw this.invalidate(error)
			}

			this.scheduler.scheduleRetry()

			throw error
		}
	}

	private async loadUser(): Promise<User> {
		const user = await this.retry(() => this.transport().fetchUser())

		session.user = user

		this.store.setState({
			user,
			user_id:
				user?._id ?? user?.user_id ?? this.decode()?.user_id ?? null,
		})

		return user
	}

	private applySession(token?: string, refreshToken?: string) {
		if (token) session.token = token
		if (refreshToken) session.refreshToken = refreshToken

		this.store.setState({
			token: session.token ?? null,
			user_id: this.decode(session.token)?.user_id ?? null,
		})
	}

	private invalidate(cause?: unknown): Error {
		this.scheduler.clear()

		// an invalid session means the stored tokens are useless
		session.deleteToken()
		session.deleteRefreshToken()
		session.user = {}

		const error =
			cause instanceof Error ? cause : new Error(errorMessage(cause))

		this.store.setState({
			status: "invalid",
			refreshing: false,
			authenticated: false,
			user: null,
			token: null,
			error: error.message,
		})

		this.emit("session:invalid", error.message)

		return error
	}
}

export default new AuthManager()
