import type { AxiosInstance, AxiosRequestConfig } from "axios"

// per request options handled by the client pipeline
declare module "axios" {
	export interface AxiosRequestConfig {
		// skip the auth handling and retries for this request
		skipAuth?: boolean
		// how many times to retry transient server errors
		maxRetries?: number
		// base delay between retries, in ms
		retryDelay?: number
		// internal retry bookkeeping
		_retried?: boolean
		_retries?: number
	}
}

// http

export type PaginatedRequest = {
	page?: number
	limit?: number
	offset?: number
}

export type PaginatedResponse<T = any> = {
	items: T[]
	has_more: boolean
	total_items: number
	page?: number
	limit?: number
}

export type CustomRequest = AxiosRequestConfig & {
	instance?: AxiosInstance
	maxRetries?: number
	retryDelay?: number
}

// events

export interface EventEmitterLike {
	on(event: string | symbol, listener: (...args: any[]) => void): any
	once(event: string | symbol, listener: (...args: any[]) => void): any
	off?(event: string | symbol, listener: (...args: any[]) => void): any
	removeListener?(
		event: string | symbol,
		listener: (...args: any[]) => void,
	): any
	emit(event: string | symbol, ...args: any[]): any
}

// logging

export type LoggerLike = Pick<Console, "log" | "warn" | "error" | "debug">

// client

export type ClientAuthPlugin = {
	// called before a request, should resolve once the token is usable
	ensureFreshToken?: () => Promise<unknown>
	// called on a 401, returns true when the request can be retried
	onUnauthorized?: () => Promise<boolean>
}

export type ClientOptions = {
	// default origin, a persisted one still takes precedence
	origin?: string
}
