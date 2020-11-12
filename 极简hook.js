//调用 setCount() 实际上调用的是 dispatchAction.bind(null,hook.queue)

//多次调用setCount()后会形成环状单项链表
function dispatchAction(queue, action) {
    // 创建update
    const update = {
        action,
        next: null
    }

    // 环状单向链表操作
    if (queue.pending === null) {
        update.next = update;
    } else {
        update.next = queue.pending.next;
        queue.pending.next = update;
    }
    queue.pending = update;

    // 模拟React开始调度更新
    schedule();
}
// queue.pending = u1 ---> u0   
//                 ^       |
//                 |       |
//                 ---------
//

//更新产生的 update数据会保存在 queue中，那么queue又储存在哪里呢
//在FunctionComponent的 Fiber中
//精简Fiber结构
// App组件对应的fiber对象
const fiber = {
    // 保存该FunctionComponent对应的Hooks链表
    memoizedState: null,
    // 指向App函数
    stateNode: App
};

//在memoizedState里保存的就是Hook的数据结构
//该数据结构如下
hook = {
    // 保存update的queue，即上文介绍的queue
    queue: {
        pending: null
    },
    // 保存hook对应的state
    memoizedState: initialState,
    // 与下一个Hook连接形成单向无环链表
    next: null
}




//useState的调度如下
function useState(initialState) {
    let hook;

    if (isMount) {
        //mount时需要生成的hook对象
        hook = {
            queue: {
                pending: null
            },
            memoizedState: initialState,
            next: null
        }
        // 将hook插入fiber.memoizedState链表末尾
        if (!fiber.memoizedState) {
            fiber.memoizedState = hook;
        } else {
            workInProgressHook.next = hook;
        }
        workInProgressHook = hook;
    } else {
        //update时从workInProgressHook中取出该useState对应的hook
        hook = workInProgressHook;
        workInProgressHook = workInProgressHook.next;
    }
    // update执行前的初始state
    let baseState = hook.memoizedState;
    //根据hook中的queue.pending中保存的 update 去更新state
    if (hook.queue.pending) {
        // 获取update环状单向链表中第一个update
        let firstUpdate = hook.queue.pending.next;

        do {
            // 执行update action
            const action = firstUpdate.action;
            baseState = action(baseState);
            firstUpdate = firstUpdate.next;
            // 最后一个update执行完后跳出循环
        } while (firstUpdate !== hook.queue.pending)

        // 清空queue.pending
        hook.queue.pending = null;
    }
    // 将update action执行完后的state作为memoizedState
    hook.memoizedState = baseState;

    return [baseState, dispatchAction.bind(null, hook.queue)];
}


