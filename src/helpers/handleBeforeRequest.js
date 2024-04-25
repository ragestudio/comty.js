export default async (request) => {
    if (__comty_shared_state.refreshingToken) {
        await new Promise((resolve) => {
            __comty_shared_state.eventBus.once("session:refreshed", resolve)
        })
    }
}