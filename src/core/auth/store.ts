import type { User } from "@comty/shared/types/user"

import { createStore } from "zustand/vanilla"

export type AuthStatus =
	| "idle"
	| "restoring"
	| "authenticating"
	| "authenticated"
	| "unauthenticated"
	| "refreshing"
	| "invalid"

export type AuthState = {
	status: AuthStatus
	initialized: boolean
	authenticated: boolean
	refreshing: boolean

	user: User | null
	user_id: string | null
	token: string | null

	error: string | null
	last_refresh: number | null
}

export const initialAuthState: AuthState = {
	status: "idle",
	initialized: false,
	authenticated: false,
	refreshing: false,

	user: null,
	user_id: null,
	token: null,

	error: null,
	last_refresh: null,
}

export const authStore = createStore<AuthState>()(() => ({
	...initialAuthState,
}))

export function resetAuthStore() {
	authStore.setState({
		...initialAuthState,
		status: "unauthenticated",
		initialized: true,
	})
}

export default authStore
