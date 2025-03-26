export default async () => {
    if (__comty_shared_state.refreshingToken === true) {
        await new Promise((resolve) => {
            __comty_shared_state.eventBus.once("session:refreshed", resolve)
        })
    }
}