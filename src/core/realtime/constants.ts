import type { RealtimeAction } from "./types"

export const FORWARDED_EVENTS = [
	"open",
	"close",
	"connected",
	"reconnecting",
	"reconnected",
	"reconnection_failed",
	"error",
]

export const AUTH_EVENTS: Array<[string, RealtimeAction]> = [
	["auth:ready", "connect"],
	["auth:login_success", "connect"],
	["session:refreshed", "reauthenticate"],
	["auth:logout_success", "disconnect"],
	["session:invalid", "disconnect"],
]
