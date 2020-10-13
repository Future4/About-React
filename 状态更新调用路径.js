/*
 *
触发状态更新（根据场景调用不同方法）
            1.ReactDOM.render
            2.this.setState
            3.this.forceUpdate
            4.useState
            5.useReducer

    |
    |
    v

创建Update对象（'updateContainer'）

    |
    |
    v

从fiber到root（`markUpdateLaneFromFiberToRoot`）
            （从触发状态更新的fiber一直向上遍历到rootFiber，并返回rootFiber。）
    |
    |
    v

调度更新（`ensureRootIsScheduled`） 同步/异步
                以下是ensureRootIsScheduled最核心的一段代码：
                if (newCallbackPriority === SyncLanePriority) {
                    // 任务已经过期，需要同步执行render阶段
                    newCallbackNode = scheduleSyncCallback(
                        performSyncWorkOnRoot.bind(null, root)
                    );
                    } else {
                    // 根据任务优先级异步执行render阶段
                    var schedulerPriorityLevel = lanePriorityToSchedulerPriority(
                        newCallbackPriority
                    );
                    newCallbackNode = scheduleCallback(
                        schedulerPriorityLevel,
                        performConcurrentWorkOnRoot.bind(null, root)
                    );
                }
    |
    |
    v

render阶段（`performSyncWorkOnRoot` 或 `performConcurrentWorkOnRoot`）

    |
    |
    v

commit阶段（`commitRoot`）



 */
