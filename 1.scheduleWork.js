

function scheduleWork(fiber: Fiber, expirationTime: ExpirationTime) {
    //scheduleWorkToRoot
    //1.找到当前Fiber的 root
    //2.给更新节点的父节点链上的每个节点的expirationTime设置为这个update的expirationTime，
    //3.给更新节点的父节点链上的每个节点的childExpirationTime设置为这个update的expirationTime
    const root = scheduleWorkToRoot(fiber, expirationTime)

    if (enableSchedulerTracing) {
        storeInteractionsForExpirationTime(root, expirationTime, true)
    }


    //当上一个任务是异步时（502ms），并且上一个的时间切片很短,当下一个超时时间很短（52ms 或者 22ms 甚至是 Sync），
    //那么优先级就变成了先执行当前任务，也就意味着上一个任务被打断了（interrupted）
    if (
        !isWorking &&
        nextRenderExpirationTime !== NoWork &&
        expirationTime < nextRenderExpirationTime
    ) {
        // This is an interruption. (Used for performance tracking.)
        interruptedBy = fiber
        //重置所有公共变量
        resetStack()
    }
    markPendingPriorityLevel(root, expirationTime)
    if (
        // If we're in the render phase, we don't need to schedule this root
        // for an update, because we'll do it before we exit...
        !isWorking ||
        isCommitting ||
        // ...unless this is a different root than the one we're rendering.
        nextRoot !== root
    ) {
        const rootExpirationTime = root.expirationTime
        requestWork(root, rootExpirationTime)
    }
}


function scheduleWorkToRoot(fiber: Fiber, expirationTime): FiberRoot | null {
    // Update the source fiber's expiration time
    if (
        fiber.expirationTime === NoWork ||
        fiber.expirationTime > expirationTime
    ) {
        fiber.expirationTime = expirationTime
    }
    let alternate = fiber.alternate
    if (
        alternate !== null &&
        (alternate.expirationTime === NoWork ||
            alternate.expirationTime > expirationTime)
    ) {
        alternate.expirationTime = expirationTime
    }
    // Walk the parent path to the root and update the child expiration time.
    let node = fiber.return
    if (node === null && fiber.tag === HostRoot) {
        return fiber.stateNode
    }
    while (node !== null) {
        alternate = node.alternate
        if (
            node.childExpirationTime === NoWork ||
            node.childExpirationTime > expirationTime
        ) {
            node.childExpirationTime = expirationTime
            if (
                alternate !== null &&
                (alternate.childExpirationTime === NoWork ||
                    alternate.childExpirationTime > expirationTime)
            ) {
                alternate.childExpirationTime = expirationTime
            }
        } else if (
            alternate !== null &&
            (alternate.childExpirationTime === NoWork ||
                alternate.childExpirationTime > expirationTime)
        ) {
            alternate.childExpirationTime = expirationTime
        }
        if (node.return === null && node.tag === HostRoot) {
            return node.stateNode
        }
        node = node.return
    }
    return null
}

//重置公共变量
function resetStack() {
    if (nextUnitOfWork !== null) {
        let interruptedWork = nextUnitOfWork.return
        while (interruptedWork !== null) {
            unwindInterruptedWork(interruptedWork)
            interruptedWork = interruptedWork.return
        }
    }

    nextRoot = null
    nextRenderExpirationTime = NoWork
    nextLatestAbsoluteTimeoutMs = -1
    nextRenderDidError = false
    nextUnitOfWork = null
}


//requestWork

function requestWork(root: FiberRoot, expirationTime: ExpirationTime) {
    addRootToSchedule(root, expirationTime)
    if (isRendering) {
        // Prevent reentrancy. Remaining work will be scheduled at the end of
        // the currently rendering batch.
        return
    }

    if (isBatchingUpdates) {
        // Flush work at the end of the batch.
        if (isUnbatchingUpdates) {
            nextFlushedRoot = root
            nextFlushedExpirationTime = Sync
            performWorkOnRoot(root, Sync, true)
        }
        return
    }

    if (expirationTime === Sync) {
        performSyncWork()
    } else {
        scheduleCallbackWithExpirationTime(root, expirationTime)
    }
}

function addRootToSchedule(root: FiberRoot, expirationTime: ExpirationTime) {
    // Add the root to the schedule.
    // Check if this root is already part of the schedule.
    if (root.nextScheduledRoot === null) {
        // This root is not already scheduled. Add it.
        root.expirationTime = expirationTime
        if (lastScheduledRoot === null) {
            firstScheduledRoot = lastScheduledRoot = root
            root.nextScheduledRoot = root
        } else {
            lastScheduledRoot.nextScheduledRoot = root
            lastScheduledRoot = root
            lastScheduledRoot.nextScheduledRoot = firstScheduledRoot
        }
    } else {
        // This root is already scheduled, but its priority may have increased.
        const remainingExpirationTime = root.expirationTime
        if (
            remainingExpirationTime === NoWork ||
            expirationTime < remainingExpirationTime
        ) {
            // Update the priority.
            root.expirationTime = expirationTime
        }
    }
}