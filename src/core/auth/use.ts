import { useStore as useZustandStore } from "zustand"

import { type AuthState, authStore } from "./store"

export function useAuth<U = AuthState>(selector?: (state: AuthState) => U): U {
	return useZustandStore(
		authStore,
		selector ?? ((state) => state as unknown as U),
	)
}

export default useAuth
