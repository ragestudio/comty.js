import refreshToken from "./refreshToken"

export default async (data, callback) => {
    // handle 401, 403 responses
    if (data instanceof Error) {
        if (data.code && (data.code === "ECONNABORTED" || data.code === "ERR_NETWORK")) {
            console.error(`Request aborted or network error`)
            return false
        }

        if (data.response.status === 401) {
            // check if the server issue a refresh token on data
            if (data.response.data.expired) {
                try {
                    console.log(`Session expired, trying to regenerate...`)

                    await refreshToken()
                } catch (error) {
                    __comty_shared_state.eventBus.emit("session.invalid", error.message)

                    console.error(`Failed to regenerate token: ${error.message}`)

                    throw new Error(`Invalid or Expired session`)
                }

                return await callback()
            }
        }

        if (data.response.status === 403) {

        }
    }
}