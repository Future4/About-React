let workInProgressHook;
let isMount = true;

const fiber = {
    //保存FunctionComponent对应的Hook链表
    memoizedState: null,
    //指向App函数
    stateNode: App
};

function schedule() {
    workInProgressHook = fiber.memoizedState;
    //触发组建render
    const app = fiber.stateNode();
    isMount = false;
    return app;
}

function dispatchAction(queue, action) {

    //创建update
    const update = {
        action,
        next: null
    }

    //环状单向链表操作
    if (queue.pending === null) {
        update.next = update;
    } else {
        update.next = queue.pending.next;
        queue.pending.next = update;
    }
    queue.pending = update;

    //模拟React开始调度更新
    schedule();
}

function useState(initialState) {
    let hook;

    if (isMount) {
        //如果是 mount
        hook = {
            queue: {
                pending: null
            },
            memoizedState: initialState,
            next: null
        }
        // 将hook插入fiber.memoizedState链表末尾
        if (!fiber.memoizedState) {
            //初始化时，FunctionComponent对应的Hook链表 指向初始化hook
            fiber.memoizedState = hook;
        } else {
            workInProgressHook.next = hook;
        }
        //移动workInProgressHook指针
        workInProgressHook = hook;
    } else {
        //update时从workInProgressHook中取出该useState对应的hook
        hook = workInProgressHook;
        workInProgressHook = workInProgressHook.next;
    }

    let baseState = hook.memoizedState;
    if (hook.queue.pending) {
        // ...根据queue.pending中保存的update更新state
        let firstUpdate = hook.queue.pending.next;

        do {
            // 执行update action
            const action = firstUpdate.action;
            baseState = action(baseState);
            firstUpdate = firstUpdate.next;
        } while (firstUpdate !== hook.queue.pending)

        //清空queue.pending
        hook.queue.pending = null;
    }
    // 将update action执行完后的state作为memoizedState
    hook.memoizedState = baseState;

    return [baseState, dispatchAction.bind(null, hook.queue)];
}

function App() {
    const [num, updateNum] = useState(0);

    console.log(`${isMount ? 'mount' : 'update'} num: `, num);

    return {
        click() {
            updateNum(num => num + 1);
        }
    }
}

window.app = schedule();