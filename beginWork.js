//beginWork 的工作是：传入当前的fiber节点，创建子fiber节点

//当 mount 时， current === null

if (current !== null) {
    const oldProps = current.memoizedProps;
    const newProps = workInProgress.pendingProps;

    //判断是否复用
    if (
        oldProps !== newProps ||
        hasLegacyContextChanged() ||
        (__DEV__ ? workInProgress.type !== current.type : false)
    ) {
        //不复用
        didReceiveUpdate = true;
    } else if (!includesSomeLane(renderLanes, updateLanes)) {//判断是否需要检查更新
        didReceiveUpdate = false;
        switch (workInProgress.tag) {
            // 省略处理
        }
        return bailoutOnAlreadyFinishedWork(
            current,
            workInProgress,
            renderLanes,
        );
    } else {
        didReceiveUpdate = false;
    }
} else {
    didReceiveUpdate = false;
}

//reconcileChildren 之后就是diff算法
export function reconcileChildren(
    current: Fiber | null,
    workInProgress: Fiber,
    nextChildren: any,
    renderLanes: Lanes
) {
    if (current === null) {
        // 对于mount的组件
        workInProgress.child = mountChildFibers(
            workInProgress,
            null,
            nextChildren,
            renderLanes,
        );
    } else {
        // 对于update的组件
        workInProgress.child = reconcileChildFibers(
            workInProgress,
            current.child,
            nextChildren,
            renderLanes,
        );
    }
}