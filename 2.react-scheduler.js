function scheduleCallbackWithExpirationTime(
    root: FiberRoot,
    expirationTime: ExpirationTime,
) {
    if (callbackExpirationTime !== NoWork) {
        // A callback is already scheduled. Check its expiration time (timeout).
        if (expirationTime > callbackExpirationTime) {
            // Existing callback has sufficient timeout. Exit.
            return
        } else {
            if (callbackID !== null) {
                // Existing callback has insufficient timeout. Cancel and schedule a
                // new one.
                cancelDeferredCallback(callbackID)
            }
        }
        // The request callback timer is already running. Don't start a new one.
    } else {
        startRequestCallbackTimer()
    }

    callbackExpirationTime = expirationTime
    const currentMs = now() - originalStartTimeMs
    const expirationTimeMs = expirationTimeToMs(expirationTime)
    const timeout = expirationTimeMs - currentMs
    //传入的回调函数，和包含timeout超时事件的对象
    callbackID = scheduleDeferredCallback(performAsyncWork, { timeout })
}