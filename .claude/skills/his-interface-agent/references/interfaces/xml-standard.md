# ObjectScript XML 接口标准模板

> 生成 XML 模式接口代码时，必须严格遵循此模板

---

## ⚠️ 必填内容规范（硬性要求）

### 1. 类头注释
```objectscript
/// ======================================================================
/// 包路径.类名
/// 功能描述：一句话说明接口用途
///
/// 数据来源: DHC HIS 系统 Global 结构说明
///
/// Package:   包路径
/// Author:    开发者
/// Date:      日期
/// ======================================================================
```

### 2. 每个方法的注释
```objectscript
/// desc: 方法说明
/// params: 参数说明
/// return: %GlobalCharacterStream (XML格式)
```

### 3. 调试命令
```objectscript
/// === 调试命令 ===
/// [终端/Portal运行]:
///     w ##class(包路径.类名).方法名(参数).Read()
```

### 4. 代码字段中文注释（每个变量赋值旁）
```objectscript
s tAdmNo=$p(admData,"^",1)       ; 挂号登记号
s tPatientId=$p(admData,"^",5)   ; 患者ID
```

### 5. 固定值抽离为 Parameter（核心设计原则）

与 Query 模式相同，机构信息等硬编码值必须抽象为 Parameter。

---

## 一、XML 接口核心模式

### 1. 类继承关系
```objectscript
Class ClassName Extends %RegisteredObject
{
    // 方法...
}
```

### 2. 返回类型
```objectscript
ClassMethod getData(pParam) As %GlobalCharacterStream
{
    s stream=##class(%GlobalCharacterStream).%New()
    // 业务逻辑...
    q stream
}
```

---

## 二、PHA.COM.XML 工具类核心用法

### 1. 创建 XML 节点对象

```objectscript
/// 方法1: 直接 New（推荐）
s root=##class(PHA.COM.XML).%New("RootNode")

/// 方法2: 类方法创建
s root=##class(PHA.COM.XML).New("RootNode")
```

### 2. 设置子节点值

```objectscript
/// 方式1: 直接属性赋值（常用）
s node."fieldName"="value"
s node."name"="张三"
s node."age"=25

/// 方式2: Set 方法
d node.Set("fieldName","value")

/// 方式3: 带 CDATA 的值
d node.Set("content","HTML内容",1)   ; 第三个参数 isCData=1
```

### 3. 设置节点属性

```objectscript
d node.SetAttr("属性名","属性值")
d person.SetAttr("type","adult")
```

### 4. 添加子节点（嵌套结构）

```objectscript
/// 创建父节点
s root=##class(PHA.COM.XML).%New("Response")

/// 创建子节点
s data=##class(PHA.COM.XML).%New("Data")

/// 子节点内设置字段
s data."name"="张三"
s data."age"=30

/// 添加子节点到父节点
d root.Insert(data)
```

### 5. 转换为 XML 字符串

```objectscript
s xmlStr=root.ToXML()
```

### 6. 转换为 XML 流（用于返回）

```objectscript
s xmlStr=root.ToXML()
s stream=##class(%GlobalCharacterStream).%New()
d stream.Write(xmlStr)
q stream
```

---

## 三、完整接口模板

```objectscript
/// ======================================================================
/// 包路径.类名
/// 功能描述：获取患者信息（XML格式）
///
/// 数据来源: DHC HIS 系统 Global 结构说明
///
/// Package:   包路径
/// Author:    开发者
/// Date:      日期
/// ======================================================================
Class ClassName Extends %RegisteredObject
{
    /// 统一社会信用代码/组织机构代码
    Parameter OrganizCode [ Constraint = "必填，9位/18位" ] = "440000000";
    /// 医疗机构名称
    Parameter OrganizName [ Constraint = "必填" ] = "XX医院";

    /// desc: 获取患者信息
    /// params: pAdmRowId: 就诊ID
    /// return: %GlobalCharacterStream (XML格式)
    /// === 调试命令 ===
    /// w ##class(包路径.类名).getPatInfo(pAdmRowId).Read()
    ClassMethod getPatInfo(pAdmRowId As %String) As %GlobalCharacterStream
    {
        s stream=##class(%GlobalCharacterStream).%New()

        s:pAdmRowId="" pAdmRowId=$c(0)
        i (pAdmRowId="") {
            s xmlStr="<Response><Code>-1</Code><Message>参数为空</Message></Response>"
            d stream.Write(xmlStr)
            q stream
        }

        // ========== 业务逻辑开始 ==========

        // 获取患者ID
        s patRowId=$p($g(^PAADM(pAdmRowId)),"^",1)        ; 患者ID

        // 创建根节点
        s root=##class(PHA.COM.XML).%New("Response")
        s root."Code"="0"
        s root."Message"="成功"

        // 创建患者信息节点
        s patient=##class(PHA.COM.XML).%New("Patient")
        s patient."patName"=$p($g(^PAPER(patRowId,"ALL")),"^",1)   ; 患者姓名
        s patient."patID"=$p($g(^PAPER(patRowId,"ALL")),"^",2)     ; 身份证号

        // 添加到根节点
        d root.Insert(patient)

        // ========== 业务逻辑结束 ==========

        // 输出XML
        s xmlStr=root.ToXML()
        d stream.Write(xmlStr)
        q stream
    }
}
```

---

## 四、常见 XML 结构示例

### 1. 简单单层结构
```xml
<Response>
    <Code>0</Code>
    <Message>成功</Message>
    <Data>内容</Data>
</Response>
```

### 2. 嵌套结构
```xml
<Response>
    <Code>0</Code>
    <Patient>
        <Name>张三</Name>
        <Age>30</Age>
    </Patient>
    <Visit>
        <AdmNo>A001</AdmNo>
        <Dept>内科</Dept>
    </Visit>
</Response>
```

### 3. 带属性的节点
```xml
<Response>
    <Patient type="adult">
        <Name>张三</Name>
    </Patient>
</Response>
```

### 4. 数组/列表结构
```xml
<Response>
    <DrugList>
        <Drug>
            <Name>阿莫西林</Name>
            <Dosage>500mg</Dosage>
        </Drug>
        <Drug>
            <Name>布洛芬</Name>
            <Dosage>200mg</Dosage>
        </Drug>
    </DrugList>
</Response>
```

---

## 五、参考示例

详见 IRIS 中实际代码：
```
PHA.COM.XML.cls                          ; XML工具类源码
```

---

## 六、Query vs XML 模式对比

| 特性 | Query 模式 | XML 模式 |
|------|------------|----------|
| 返回类型 | Query (ROWSPEC) | %GlobalCharacterStream |
| 数据格式 | $lb() 列表 | XML 字符串 |
| 调用方式 | SQL / `d ##class().Query()` | `w ##class().Method().Read()` |
| 适用场景 | 数据集查询、报表 | webservice、消息推送 |
| PHA.COM.XML | 不需要 | 核心工具类 |

---

## 七、常见错误对照

| 错误写法 | 正确写法 | 说明 |
|----------|----------|------|
| `s node.DEPT_CODE=val` | `s node."DEPT_CODE"=val` | 外部类带下划线属性必须双引号 |
| `s root = ##class(PHA.COM.XML).%New()` | `s root=##class(PHA.COM.XML).%New()` | 赋值操作符两边不能有空格 |
| `Set root=...` | `s root=...` | 命令必须缩写 |
| `Quit stream` | `q stream` | 命令必须缩写 |
| `Do root.Insert(data)` | `d root.Insert(data)` | 命令必须缩写 |
