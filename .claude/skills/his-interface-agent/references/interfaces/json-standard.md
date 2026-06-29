# ObjectScript JSON 接口标准模板

> 生成 JSON 模式接口代码时，必须严格遵循此模板

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
/// params: pInput: JSON格式请求参数
/// return: %GlobalCharacterStream (JSON格式)
```

### 3. 调试命令
```objectscript
/// === 调试命令 ===
/// [终端/Portal运行]:
///     w ##class(包路径.类名).方法名('{"key":"value"}').Read()
/// [HTTP请求调用]:
///     POST /api/xxx
///     Body: {"key": "value"}
```

### 4. 代码字段中文注释
```objectscript
s patRowId=$p(^PAADM(admRowId),"^",1)    ; 患者ID
s admDate=$p(admData,"^",6)              ; 入院日期
```

---

## 一、JSON 接口核心模式

### 1. 类继承关系
```objectscript
Class ClassName Extends %RegisteredObject
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

## 二、IRIS 内置 JSON 处理

> IRIS 原生支持 JSON，无需第三方工具类

### 1. 解析输入 JSON

```objectscript
/// JSON字符串转动态对象
s inputObj={}.%FromJSON(pInput)

/// 获取字段值
s param1=inputObj.%Get("key1")
s param2=inputObj.%Get("key2")

/// 类型转换（日期格式）
i param1["-" s param1=$zdh(param1,3)
```

### 2. 构建输出 JSON（核心语法）

```objectscript
/// 创建响应根对象
s retObj={}

/// 设置属性值 — 必须用 %Set() 方法！
d retObj.%Set("Code","200")
d retObj.%Set("Msg","成功")
d retObj.%Set("Data",dataArr)

/// 转换为JSON字符串
s retjson=retObj.%ToJSON()

/// 输出到流
s stream=##class(%GlobalCharacterStream).%New()
d stream.Write(retjson)
q stream
```

### 3. 构建数据对象（必须用 %Set）

```objectscript
/// 创建空对象
s dataObj={}

/// 设置属性 — 必须用 %Set()，不能用 .field =
d dataObj.%Set("field1",value1)              ; 字段1说明
d dataObj.%Set("field2",value2)              ; 字段2说明
d dataObj.%Set("field3",value3,"number")     ; 数值类型可选第三个参数

/// 推入数组
s dataArr=[]
d dataArr.%Push(dataObj)
```

### 4. 嵌套对象

```objectscript
s childObj={}
d childObj.%Set("name","xxx")
d childObj.%Set("value",123)

s parentObj={}
d parentObj.%Set("child",childObj)
```

### 5. 嵌套数组

```objectscript
s subArr=[]
s subObj={}
d subObj.%Set("item","value")
d subArr.%Push(subObj)

s parentObj={}
d parentObj.%Set("list",subArr)
```

---

## 三、完整接口模板

```objectscript
/// ======================================================================
/// 包路径.类名
/// 功能描述：诊断信息查询（JSON格式）
///
/// 数据来源: DHC HIS 系统 MR_Diagnos/MR_Adm Global 结构说明
///
/// Package:   包路径
/// Author:    AI Generator
/// Date:      2026-04-23
/// ======================================================================
Class web.DHCENS.BLL.DBZ.GetDiagInfo Extends %RegisteredObject
{
    /// === 调试命令 ===
    /// [终端/Portal运行]:
    ///     w ##class(包路径.类名).getDiagInfo("流水号").Read()
    /// [HTTP请求调用]:
    ///     POST /api/dbz/diaginfo
    ///     Body: {"ZYLB_LSH": "2023482589"}
    ClassMethod getDiagInfo(pLsh As %String) As %GlobalCharacterStream
    {
        s stream=##class(%GlobalCharacterStream).%New()
        s $zt="err"

        // ========== 参数校验 ==========
        i (pLsh="") {
            d stream.Write("{""code"":1,""msg"":""参数错误"",""data"":[]}")
            q stream
        }

        // ========== 业务逻辑 ==========
        // ... 查询逻辑 ...

        // ========== 构建响应 ==========
        s dataArr=[]
        s dataObj={}
        d dataObj.%Set("ZDXX_HZJZH",regNo)       ; 患者就诊号
        d dataObj.%Set("ZDXX_LSH",pLsh)          ; 流水号
        d dataArr.%Push(dataObj)

        s retObj={}
        d retObj.%Set("code",0)
        d retObj.%Set("msg","请求成功")
        d retObj.%Set("data",dataArr)

        d stream.Write(retObj.%ToJSON())
        q stream

err
        s $zt=""  ; 防死循环
        s retObj={}
        d retObj.%Set("code",99)
        d retObj.%Set("msg",$ze)
        d retObj.%Set("data",[])
        d stream.Write(retObj.%ToJSON())
        q stream
    }

    // ========== 公共方法（自包含，不依赖外部类）==========

    /// desc: 根据住院流水号获取就诊ID
    /// params: pLsh: 住院流水号
    /// return: 就诊ID
    ClassMethod getAdmIdByLsh(pLsh As %String) As %String
    {
        s admId=""
        // 方式1：通过PAPER.SSN索引
        s admId=$o(^PAPERi("SSN",pLsh,""))
        // 方式2：通过PAPMI_Initials
        i admId="" {
            s admId=$o(^PAPERi("PAPMI_Initials",pLsh,""))
        }
        // 方式3：通过PAADMi("No")索引
        i admId="" {
            s tmpId=""
            f {
                s tmpId=$o(^PAADMi("No",pLsh,tmpId))
                q:tmpId=""
                i $d(^PAADMi("No",pLsh,tmpId)) {
                    s admId=tmpId
                    q
                }
            }
        }
        q admId
    }

    /// desc: 根据就诊ID获取登记号
    /// params: pAdmId: 就诊ID
    /// return: 登记号
    ClassMethod getRegNoByAdmId(pAdmId As %String) As %String
    {
        q:pAdmId="" ""
        s papmiId=$p($g(^PAADM(pAdmId)),"^",1)
        q:papmiId="" ""
        s regNo=$p($g(^PAPER(papmiId,"PAT",1)),"^",1)
        q regNo
    }
}
```

---

## 四、输出 JSON 结构示例

### 1. 成功响应
```json
{
    "code": 0,
    "msg": "请求成功",
    "data": [
        {
            "ZDXX_HZJZH": "患者就诊号",
            "ZDXX_LSH": "流水号",
            "ZDXX_ZDXH": "1",
            "ZDXX_ZDBM": "ICD编码",
            "ZDXX_ZDMC": "诊断名称",
            "ZDXX_ZDLX": "诊断类型",
            "ZDXX_ZDSJ": "2026-01-01"
        }
    ]
}
```

### 2. 失败响应
```json
{
    "code": 1,
    "msg": "未找到数据",
    "data": []
}
```

---

## 五、三种接口模式对比

| 特性 | Query 模式 | XML 模式 | JSON 模式 |
|------|------------|----------|-----------|
| 返回类型 | Query (ROWSPEC) | %GlobalCharacterStream | %GlobalCharacterStream |
| 数据格式 | $lb() 列表 | XML 字符串 | JSON 字符串 |
| 解析输入 | 参数直传 | 参数直传 | `inputObj.%FromJSON()` |
| 构建输出 | $lb() → ROWSPEC | `PHA.COM.XML` | `{}.%ToJSON()` + `%Set()` |
| 适用场景 | 数据集查询 | webservice | REST API |
| 工具类 | 不需要 | PHA.COM.XML | 不需要 |
| 包路径 | 按业务系统分开 | 按业务系统分开 | 按业务系统分开 |

---

## 六、常见错误对照

| 错误写法 | 正确写法 | 说明 |
|----------|----------|------|
| `s obj.field = val` | `d obj.%Set("field",val)` | 必须用 %Set() 方法赋值 |
| `s retjson = retObj.ToJSON()` | `s retjson=retObj.%ToJSON()` | 需要百分号前缀 |
| `d arr.Push(obj)` | `d arr.%Push(obj)` | 数组方法需要百分号前缀 |
| `s val = input.key` | `s val=input.%Get("key")` | 使用 %Get 方法取值 |
| 依赖外部公共类 | 内联方法到本类 | **自包含原则：单文件可部署** |
| `s name = $p(...)` | `s name=$p(...)` | 赋值两边不能有空格 |
| `Set name=$p(...)` | `s name=$p(...)` | 命令必须缩写 |
| `Quit stream` | `q stream` | 命令必须缩写 |

---

## 七、生成规则约束

### 7.1 包路径命名规范（按系统分开）

| 系统 | 包路径前缀 | 示例 |
|------|------------|------|
| 智慧健康 | `web.DHCENS.BLL.SmartHealth.*` | `web.DHCENS.BLL.SmartHealth.OP.*` |
| 血透系统 | `web.DHCENS.BLL.BloodPurification.*` | `web.DHCENS.BLL.BloodPurification.getInpatInfo` |
| 单病种 | `web.DHCENS.BLL.DBZ.*` | `web.DHCENS.BLL.DBZ.getDiagInfo` |
| 急诊系统 | `web.DHCENS.BLL.Emergency.*` | `web.DHCENS.BLL.Emergency.*` |

### 7.2 自包含原则

**核心约束：生成的每个接口类必须是自包含的，不能假设外部 routine/class 存在。**

正确做法：
1. 公共取值方法作为 `ClassMethod` 写在同一 `.cls` 内部
2. 确保单文件可部署，无需额外依赖
3. 如果多个类需要复用，可抽离到同包 `Util` 类（但主接口类仍需自带 fallback）

### 7.3 错误处理

```objectscript
ClassMethod getData(pParam) As %GlobalCharacterStream
{
    s stream=##class(%GlobalCharacterStream).%New()
    s $zt="err"

    // 业务逻辑...

    q stream

err
    s $zt=""  ; 防死循环
    s retObj={}
    d retObj.%Set("code",99)
    d retObj.%Set("msg",$ze)
    d retObj.%Set("data",[])
    d stream.Write(retObj.%ToJSON())
    q stream
}
```
