
//Component 和 PureComponent 的区别在于
// PureComponent多了一个PureComponent.isPureReactComponent=true
//且PureComponent是继承Component的
function Component(props, context, updater) {
    this.props = props;
    this.context = context;
    // If a component has string refs, we will assign a different object later.
    this.refs = emptyObject;
    // We initialize the default updater but the real one gets injected by the
    // renderer.
    this.updater = updater || ReactNoopUpdateQueue;
}

function PureComponent(props, context, updater) {
    this.props = props;
    this.context = context;
    // If a component has string refs, we will assign a different object later.
    this.refs = emptyObject;
    this.updater = updater || ReactNoopUpdateQueue;
}

const pureComponentPrototype = (PureComponent.prototype = new ComponentDummy());
pureComponentPrototype.constructor = PureComponent;
// Avoid an extra prototype jump for these methods.
Object.assign(pureComponentPrototype, Component.prototype);
pureComponentPrototype.isPureReactComponent = true;



//PureComponent会浅比较props和state是否改变，来决定是否重新渲染组件
<FriendsItem
    key={friend.id}
    name={friend.name}
    id={friend.id}
    onDeleteClick={() => this.deleteFriends(friend.id)}
/>
// 在父组件中绑定
// 父组件在 props 中传递了一个箭头函数。箭头函数在每次 render 时都会重新分配（和使用 bind 的方式相同）

class FriendsItem extends React.PureComponent {
    render() {
        const { name, onDeleteClick } = this.props
        console.log(`FriendsItem：${name} 渲染`)
        return (
            <div>
                <span>{name}</span>
                <button onClick={onDeleteClick}>删除</button>
            </div>
        )
    }
}
// 每次点击删除操作时，未删除的 FriendsItem 都将被重新渲染
// 父组件在 render 声明了一个函数onDeleteClick，每次父组件渲染都会重新生成新的函数。
// 因此，每次父组件重新渲染，都会给每个子组件 FriendsItem 传递不同的 props，导致每个子组件都会重新渲染， 即使 FriendsItem 为 PureComponent。


// 要解决这个问题，只需要将原本在父组件上的绑定放到子组件上即可。FriendsItem 将始终具有相同的 props，并且永远不会导致不必要的重新渲染。

<FriendsItem
    key={friend.id}
    id={friend.id}
    name={friend.name}
    onClick={this.deleteFriends}
/>
class FriendsItem extends React.PureComponent {
    onDeleteClick = () => {
        this.props.onClick(this.props.id)
    } // 在子组件中绑定
    render() {
        const { name } = this.props
        console.log(`FriendsItem：${name} 渲染`)
        return (
            <div>
                <span>{name}</span>
                <button onClick={this.onDeleteClick}>删除</button>
            </div>
        )
    }
}
// 每次点击删除操作时，FriendsItem 都不会被重新渲染

//React 中对比一个 ClassComponent 是否需要更新，只有两个地方。
//一是看有没有 shouldComponentUpdate 方法;二就是这里的 PureComponent 判断;