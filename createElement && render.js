const element = <h1 title="foo">Hello</h1>
const container = document.getElementById("root")
ReactDOM.render(element, container)


const element = <h1 title="foo">Hello</h1>

//这是一个jsx
//他不是一个原始的js，所以需要通过babel来转化成原始的js

const element = React.createElement(
    "h1",
    { title: "foo" },
    "Hello"
)

//他会调用createElement通过参数生成一个对象

const element = {
    type: 'h1',
    props: {
        title: "foo",
        children: "Hello",
    }
}
//在render的时候

const node = document.createElement(element.type)
node["title"] = element.props.title

const text = document.createTextNode("")
text["nodeValue"] = element.props.children

node.appendChild(text)
container.appendChild(node)

//children永远都是一个数组，子数组可能是一个string或者number，所以我们将不是object的都放在自己的元素中，
//并且创建特殊的type TEXT_ELEMENT
function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map(child =>
                typeof child === 'object' ?
                    child : createTextElement(child)
            )
        }
    }
}
function createTextElement(text) {
    return {
        type: 'TEXT_ELEMENT',
        props: {
            nodeValue: text,
            children: []
        }
    }
}

function render(element, container) {
    
    const dom = element.type === "TEXT_ELEMENT" ?
        document.createTextNode("") :
        document.createElement(element.type)


    const isProperty = key => key !== "children"
    Object.keys(element.props).filter(isProperty).forEach(name => {
        dom[name] = element.props[name]
    })


    element.props.children.forEach(item => render(item, dom))
    container.appendChild(dom)
}
const element = (
    <div id="foo">
        <a>bar</a>
        <b />
    </div>
)
const element = React.createElement(
    "div",
    { id: "foo" },
    React.createElement("a", null, "bar"),
    React.createElement("b")
)
