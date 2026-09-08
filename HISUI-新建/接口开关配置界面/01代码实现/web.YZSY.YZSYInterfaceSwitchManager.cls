Class web.YZSY.YZSYInterfaceSwitchManager Extends DHCDoc.Util.RegisteredObject
{

/// 返回所有接口完整配置JSON（含节点+计算后状态）
ClassMethod GetAllInterfaces() As %String
{
    s json = "["
    s ifCode = ""
    f {
        s ifCode = $o(^YZSYInterfaceSwitch("InterfaceDef", ifCode))
        q:ifCode=""
        s ifName = $g(^YZSYInterfaceSwitch("InterfaceDef", ifCode))
        s mSwitch = $g(^YZSYInterfaceSwitch("Master", ifCode), "OFF")
        s:json'="[" json = json _ ","
        s json = json _ "{""InterfaceCode"":""" _ ifCode _ """,""InterfaceName"":""" _ ifName _ """,""MasterSwitch"":""" _ mSwitch _ """,""Nodes"":["
        s nodeCode = "", firstNode = 1
        f {
            s nodeCode = $o(^YZSYInterfaceSwitch("NodeDef", ifCode, nodeCode))
            q:nodeCode=""
            s nodeName = $g(^YZSYInterfaceSwitch("NodeDef", ifCode, nodeCode))
            s nSwitch = $g(^YZSYInterfaceSwitch("Node", ifCode, nodeCode), "OFF")
            s status = "OFF"
            s:(mSwitch="ON")&&(nSwitch="ON") status = "ON"
            s:'firstNode json = json _ ","
            s firstNode = 0
            s json = json _ "{""Code"":""" _ nodeCode _ """,""Name"":""" _ nodeName _ """,""Switch"":""" _ nSwitch _ """,""Status"":""" _ status _ """}"
        }
        s json = json _ "]}"
    }
    s json = json _ "]"
    q json
}

/// 设置接口总开关
ClassMethod SetMasterSwitch(interfaceCode As %String, value As %String) As %String
{
    q:interfaceCode="" "{""success"":false,""msg"":""接口编码不能为空""}"
    q:'$d(^YZSYInterfaceSwitch("InterfaceDef", interfaceCode)) "{""success"":false,""msg"":""接口不存在""}"
    q:(value'="ON")&&(value'="OFF") "{""success"":false,""msg"":""开关值只能为ON或OFF""}"
    l +^YZSYInterfaceSwitch("Master", interfaceCode):10
    e  q "{""success"":false,""msg"":""系统繁忙，请稍后重试""}"
    s ^YZSYInterfaceSwitch("Master", interfaceCode) = value
    l -^YZSYInterfaceSwitch("Master", interfaceCode)
    q "{""success"":true}"
}

/// 设置节点开关
ClassMethod SetNodeSwitch(interfaceCode As %String, nodeCode As %String, value As %String) As %String
{
    q:interfaceCode="" "{""success"":false,""msg"":""接口编码不能为空""}"
    q:nodeCode="" "{""success"":false,""msg"":""节点编码不能为空""}"
    q:(value'="ON")&&(value'="OFF") "{""success"":false,""msg"":""开关值只能为ON或OFF""}"
    q:'$d(^YZSYInterfaceSwitch("NodeDef", interfaceCode, nodeCode)) "{""success"":false,""msg"":""节点不存在""}"
    l +^YZSYInterfaceSwitch("Node", interfaceCode, nodeCode):10
    e  q "{""success"":false,""msg"":""系统繁忙，请稍后重试""}"
    s ^YZSYInterfaceSwitch("Node", interfaceCode, nodeCode) = value
    l -^YZSYInterfaceSwitch("Node", interfaceCode, nodeCode)
    q "{""success"":true}"
}

/// 新增接口定义
ClassMethod AddInterface(interfaceCode As %String, interfaceName As %String) As %String
{
    q:interfaceCode="" "{""success"":false,""msg"":""接口编码不能为空""}"
    q:interfaceName="" "{""success"":false,""msg"":""接口名称不能为空""}"
    q:$d(^YZSYInterfaceSwitch("InterfaceDef", interfaceCode)) "{""success"":false,""msg"":""接口编码已存在""}"
    l +^YZSYInterfaceSwitch("InterfaceDef", interfaceCode):10
    e  q "{""success"":false,""msg"":""系统繁忙，请稍后重试""}"
    s ^YZSYInterfaceSwitch("InterfaceDef", interfaceCode) = interfaceName
    s ^YZSYInterfaceSwitch("Master", interfaceCode) = "OFF"
    l -^YZSYInterfaceSwitch("InterfaceDef", interfaceCode)
    q "{""success"":true}"
}

/// 新增节点定义
ClassMethod AddNode(interfaceCode As %String, nodeCode As %String, nodeName As %String) As %String
{
    q:interfaceCode="" "{""success"":false,""msg"":""接口编码不能为空""}"
    q:nodeCode="" "{""success"":false,""msg"":""节点编码不能为空""}"
    q:nodeName="" "{""success"":false,""msg"":""节点名称不能为空""}"
    q:'$d(^YZSYInterfaceSwitch("InterfaceDef", interfaceCode)) "{""success"":false,""msg"":""接口不存在""}"
    q:$d(^YZSYInterfaceSwitch("NodeDef", interfaceCode, nodeCode)) "{""success"":false,""msg"":""节点编码已存在""}"
    s lockNode = interfaceCode _ "|" _ nodeCode
    l +^YZSYInterfaceSwitch("NodeDef", interfaceCode, nodeCode):10
    e  q "{""success"":false,""msg"":""系统繁忙，请稍后重试""}"
    s ^YZSYInterfaceSwitch("NodeDef", interfaceCode, nodeCode) = nodeName
    s ^YZSYInterfaceSwitch("Node", interfaceCode, nodeCode) = "OFF"
    l -^YZSYInterfaceSwitch("NodeDef", interfaceCode, nodeCode)
    q "{""success"":true}"
}

/// 删除接口及下属所有节点
ClassMethod DeleteInterface(interfaceCode As %String) As %String
{
    q:interfaceCode="" "{""success"":false,""msg"":""接口编码不能为空""}"
    q:'$d(^YZSYInterfaceSwitch("InterfaceDef", interfaceCode)) "{""success"":false,""msg"":""接口不存在""}"
    l +^YZSYInterfaceSwitch("InterfaceDef", interfaceCode):10
    e  q "{""success"":false,""msg"":""系统繁忙，请稍后重试""}"
    k ^YZSYInterfaceSwitch("InterfaceDef", interfaceCode)
    k ^YZSYInterfaceSwitch("Master", interfaceCode)
    k ^YZSYInterfaceSwitch("NodeDef", interfaceCode)
    k ^YZSYInterfaceSwitch("Node", interfaceCode)
    l -^YZSYInterfaceSwitch("InterfaceDef", interfaceCode)
    q "{""success"":true}"
}

/// 删除单个节点
ClassMethod DeleteNode(interfaceCode As %String, nodeCode As %String) As %String
{
    q:interfaceCode="" "{""success"":false,""msg"":""接口编码不能为空""}"
    q:nodeCode="" "{""success"":false,""msg"":""节点编码不能为空""}"
    q:'$d(^YZSYInterfaceSwitch("NodeDef", interfaceCode, nodeCode)) "{""success"":false,""msg"":""节点不存在""}"
    l +^YZSYInterfaceSwitch("NodeDef", interfaceCode, nodeCode):10
    e  q "{""success"":false,""msg"":""系统繁忙，请稍后重试""}"
    k ^YZSYInterfaceSwitch("NodeDef", interfaceCode, nodeCode)
    k ^YZSYInterfaceSwitch("Node", interfaceCode, nodeCode)
    l -^YZSYInterfaceSwitch("NodeDef", interfaceCode, nodeCode)
    q "{""success"":true}"
}

/// 外部系统调用获取节点开关状态（两个参数必须同时传入）
ClassMethod GetSwitchStatus(interfaceCode As %String, nodeCode As %String) As %String
{
    q:interfaceCode="" "{""error"":""接口编码不能为空""}"
    q:nodeCode="" "{""error"":""节点编码不能为空""}"
    q:'$d(^YZSYInterfaceSwitch("InterfaceDef", interfaceCode)) "{""error"":""接口不存在""}"
    q:'$d(^YZSYInterfaceSwitch("NodeDef", interfaceCode, nodeCode)) "{""error"":""节点不存在""}"
    s ifName = $g(^YZSYInterfaceSwitch("InterfaceDef", interfaceCode))
    s nodeName = $g(^YZSYInterfaceSwitch("NodeDef", interfaceCode, nodeCode))
    s mSwitch = $g(^YZSYInterfaceSwitch("Master", interfaceCode), "OFF")
    s nSwitch = $g(^YZSYInterfaceSwitch("Node", interfaceCode, nodeCode), "OFF")
    s status = "OFF"
    s:(mSwitch="ON")&&(nSwitch="ON") status = "ON"
    q "{""InterfaceCode"":""" _ interfaceCode _ """,""InterfaceName"":""" _ ifName _ """,""NodeCode"":""" _ nodeCode _ """,""NodeName"":""" _ nodeName _ """,""MasterSwitch"":""" _ mSwitch _ """,""Switch"":""" _ nSwitch _ """,""Status"":""" _ status _ """}"
}

}
