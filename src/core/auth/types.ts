import type { User } from "@comty/shared/types/user"
import type { EventEmitterLike, LoggerLike } from "../../types"

export type LoginPayload = {
	username: string
	password: string
	mfa_code?: string
}

export type AuthResponse = {
	token?: string
	refreshToken?: string
	mfa_required?: boolean
	activation_required?: boolean
	[key: string]: any
}

export type AuthTransport = {
	login(payload: LoginPayload): Promise<AuthResponse>
	refresh(authToken: string, refreshToken: string): Promise<AuthResponse>
	fetchUser(): Promise<User>
	logout(): Promise<unknown>
}

export type AuthManagerOptions = {
	transport?: Partial<AuthTransport>
	eventBus?: EventEmitterLike
	logger?: LoggerLike

	// enable proactive refresh before the token expires
	autoRefresh?: boolean
	// seconds before expiry to trigger a refresh
	refreshThreshold?: number
	// lower bound for the refresh timer, avoids tight loops
	minRefreshDelay?: number
	// upper bound used by the retry backoff
	maxRefreshDelay?: number
	// base delay for the retry backoff
	retryDelay?: number
	// how many times a request is retried on transient errors
	maxRetries?: number
}

export type AuthEventMap = {
	"auth:ready": () => void
	"auth:login_success": (data: AuthResponse) => void
	"auth:mfa_required": (data: AuthResponse) => void
	"auth:activation_required": (data: AuthResponse) => void
	"auth:logout_success": () => void
	"session:refreshing": () => void
	"session:refreshed": (data: AuthResponse) => void
	"session:invalid": (message: string) => void
	error: (error: Error) => void
}

export const AUTH_EVENT_NAMES = [
	"auth:ready",
	"auth:login_success",
	"auth:mfa_required",
	"auth:activation_required",
	"auth:logout_success",
	"session:refreshing",
	"session:refreshed",
	"session:invalid",
] as const satisfies ReadonlyArray<keyof AuthEventMap>
