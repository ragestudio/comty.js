import type { AxiosInstance, AxiosRequestConfig } from "axios"

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

export interface EventEmitterLike {
	on(event: string | symbol, listener: (...args: any[]) => void): any
	off?(event: string | symbol, listener: (...args: any[]) => void): any
	removeListener?(
		event: string | symbol,
		listener: (...args: any[]) => void,
	): any
	emit(event: string | symbol, ...args: any[]): any
}

export type WebsocketManagerParams = {
	enable: boolean
	autoConnect: boolean
}

export type ClientOptions = {
	origin?: string
	accessKey?: string
	privateKey?: string
	ws?: WebsocketManagerParams
	eventBus?: EventEmitterLike
}
