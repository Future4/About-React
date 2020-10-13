// react的diff预设了三个限制
// 1.只对同级元素进行Diff。如果一个DOM节点在前后两次更新中跨越了层级，那么React不会尝试复用他。

// 2.两个不同类型的元素会产生出不同的树。如果元素由div变为p，React会销毁div及其子孙节点，并新建p及其子孙节点。

// 3.开发者可以通过 key prop来暗示哪些子元素在不同的渲染下能保持稳定

// 根据newChild类型选择不同diff函数处理
function reconcileChildFibers(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    newChild: any,
): Fiber | null {

    const isObject = typeof newChild === 'object' && newChild !== null;

    if (isObject) {
        // object类型，可能是 REACT_ELEMENT_TYPE 或 REACT_PORTAL_TYPE
        switch (newChild.$$typeof) {
            case REACT_ELEMENT_TYPE:
            // 调用 reconcileSingleElement 处理
            // // ...省略其他case
        }
    }

    if (typeof newChild === 'string' || typeof newChild === 'number') {
        // 调用 reconcileSingleTextNode 处理
        // ...省略
    }

    if (isArray(newChild)) {
        // 调用 reconcileChildrenArray 处理
        // ...省略
    }

    // 一些其他情况调用处理函数
    // ...省略

    // 以上都没有命中，删除节点
    return deleteRemainingChildren(returnFiber, currentFirstChild);
}

// 我们可以从同级的节点数量将Diff分为两类：

// 1.当newChild类型为object、number、string，代表同级只有一个节点

// 2.当newChild类型为Array，同级有多个节点


//判断DOM节点是否可以复用
function reconcileSingleElement(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    element: ReactElement
): Fiber {
    const key = element.key;
    let child = currentFirstChild;

    // 首先判断是否存在对应DOM节点
    while (child !== null) {
        // 上一次更新存在DOM节点，接下来判断是否可复用

        // 首先比较key是否相同
        if (child.key === key) {

            // key相同，接下来比较type是否相同

            switch (child.tag) {
                // ...省略case

                default: {
                    if (child.elementType === element.type) {
                        // type相同则表示可以复用
                        // 返回复用的fiber
                        return existing;
                    }

                    // type不同则跳出循环
                    break;
                }
            }
            // 代码执行到这里代表：key相同但是type不同
            // 将该fiber及其兄弟fiber标记为删除
            deleteRemainingChildren(returnFiber, child);
            break;
        } else {
            // key不同，将该fiber标记为删除
            deleteChild(returnFiber, child);
        }
        child = child.sibling;
    }

    // 创建新Fiber，并返回 ...省略
}

//diff会进行两轮遍历
//第一轮：判断新旧fiber是否可以复用，不可以复用进入第二轮
//第二轮：1.newChildren与oldFiber同时遍历完
//       那就是最理想的情况：只需在第一轮遍历进行组件更新。此时Diff结束。

//       2.newChildren没遍历完，oldFiber遍历完
//       已有的DOM节点都复用了，这时还有新加入的节点，意味着本次更新有新节点插入，我们只需要遍历剩下的newChildren为生成的workInProgress fiber依次标记Placement。

//       3.newChildren遍历完，oldFiber没遍历完
//       意味着本次更新比之前的节点数量少，有节点被删除了。所以需要遍历剩下的oldFiber，依次标记Deletion。

//       4.newChildren与oldFiber都没遍历完
//       这意味着有节点在这次更新中改变了位置。

