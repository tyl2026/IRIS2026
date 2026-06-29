# ObjectScript Query 接口标准模板

> 生成 Query 模式代码时，必须严格遵循此模板，固定代码部分禁止修改

---

## ⚠️ 必填内容规范（硬性要求）

生成接口代码时，以下内容**必须包含**，不能省略：

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
/// return: 返回值说明
/// ROWSPEC: 字段顺序说明（Query方法必须）
```

### 3. 调试命令（每个 Query 方法下都要）
```objectscript
/// === 调试命令 ===
/// [终端/Portal运行]:
///     d ##class(包路径.类名).方法名(参数)
/// [数据库软件SQL调用]:
///     CALL 包路径_类名_方法名(参数值)
```

### 4. 代码字段中文注释（每个变量赋值旁）
```objectscript
s tAdmNo=$p(admData,"^",1)       ; 挂号登记号
s tPatientId=$p(admData,"^",5)   ; 患者ID
s tDeptCode=$p(admData,"^",6)    ; 就诊科室代码
```

### 5. 固定值抽离为 Parameter（核心设计原则）

**原则**：机构信息、默认值、配置类硬编码值必须抽象为 `Parameter`，禁止直接写在 `OutRow` 的 `$lb()` 里。

**Parameter 定义规范**：
```objectscript
Class ClassName Extends %RegisteredObject
{
    /// 统一社会信用代码/组织机构代码（行政区划代码）
    Parameter OrganizCode [ Constraint = "必填，9位/18位" ] = "440000000";
    /// 医疗机构名称
    Parameter OrganizName [ Constraint = "必填" ] = "XX医院";
    /// 机构所属行政区划代码（省+市代码）
    Parameter OrganizRegion [ Constraint = "6位代码" ] = "440100";
    /// 是否对接省级平台：1=是 0=否
    Parameter IsBMIDO = "1";

    // ... Query ...
}
```

**引用方式**：`..#ParameterName`（注意两个 `#`）
```objectscript
OutRow
    s Data=$lb(..#OrganizCode,"",tAdmNo,..#OrganizName,..#OrganizRegion,...)
```

---

## 一、Query 四部分完整模板

### 1. Query 定义

```objectscript
/// desc: 获取XXX信息
/// debug: d ##class(包路径.类名).queryName(参数)
/// SqlProc: CALL 包路径_类名_queryName(参数值)
Query queryName(pParam1 As %String, pParam2 As %String) As %Query(ROWSPEC = "col1,col2,col3,...") [ SqlProc ]
{
}
```

**要点：**
- `ROWSPEC` 必须声明所有输出列及顺序
- `[ SqlProc ]` 标记允许 SQL 过程调用
- Query 定义体内必须为空 `{}`

---

### 2. Execute 方法

```objectscript
ClassMethod queryNameExecute(ByRef qHandle As %Binary, pParam1 As %String, pParam2 As %String) As %Status
{
    s repid=$i(^CacheTemp)                 // tip1: query计数，确保唯一
    s qHandle=$lb(0,repid,0)               // tip2: 创建链表 (状态,repid,行号)
    s ind=1                                // tip3: 初始化行号

    s:pParam1=$c(0) pParam1=""             // 空值处理
    s:pParam2=$c(0) pParam2=""

    i ($g(pParam1)="") s qHandle=$lb(0,repid,0) q $$$OK  // 空参校验
    i ($g(pParam2)="") s qHandle=$lb(0,repid,0) q $$$OK

    // ========== 业务逻辑开始 ==========
    // TODO: 根据参数查询数据

    // ========== 业务逻辑结束 ==========

    q $$$OK

OutRow
    s Data=$lb(field1,field2,field3)       // $lb()必须单行！
    s ^CacheTemp(repid,ind)=Data           // tip4: 存入临时global
    s ind=ind+1                            // tip5: 行号+1
    q
}
```

**要点：**
- `$lb()` **必须单行书写**，多行逗号分隔会导致语法错误
- `OutRow` 标签必须在 `q $$$OK` 之后定义
- `^CacheTemp(repid,ind)` 用于存储查询结果

---

### 3. Close 方法

```objectscript
ClassMethod queryNameClose(ByRef qHandle As %Binary) As %Status [ PlaceAfter = queryNameExecute ]
{
    s repid=$li(qHandle,2)
    k ^CacheTemp(repid)                    // tip8: 必须kill清理临时数据
    q $$$OK
}
```

**要点：**
- `[ PlaceAfter = queryNameExecute ]` 标记方法顺序
- 必须 `k ^CacheTemp(repid)` 释放内存

---

### 4. Fetch 方法

```objectscript
ClassMethod queryNameFetch(ByRef qHandle As %Binary, ByRef Row As %List, ByRef AtEnd As %Integer = 0) As %Status [ PlaceAfter = queryNameExecute ]
{
    s AtEnd=$li(qHandle,1)                 // tip6: 取状态标识(0=未结束,非0=结束)
    s repid=$li(qHandle,2)                 // tip7: 取repid
    s ind=$li(qHandle,3)

    s ind=$o(^CacheTemp(repid,ind))
    If ind="" {
        s AtEnd=1
        s Row=""
    }
    Else {
        s Row=^CacheTemp(repid,ind)
    }

    s qHandle=$lb(AtEnd,repid,ind)         // 更新qHandle
    q $$$OK
}
```

**要点：**
- 返回类型是 **`%Status`**，不是 `%Integer`
- 从 `^CacheTemp(repid,ind)` 逐条取数据

---

## 二、qHandle 三元组结构

| 位置 | 含义 | 说明 |
|------|------|------|
| `$li(qHandle,1)` | AtEnd | 0=未结束, 非0=结束 |
| `$li(qHandle,2)` | repid | `^CacheTemp` 的唯一标识 |
| `$li(qHandle,3)` | ind | 当前行号 |

---

## 三、常见错误对照

| 错误写法 | 正确写法 | 说明 |
|----------|----------|------|
| `$lb(\n  a,\n  b\n)` | `$lb(a,b,c)` | `$lb()`必须单行 |
| `Fetch() As %Integer` | `Fetch() As %Status` | 返回类型必须是%Status |
| 循环内 `continue` | 循环内 `q` | 点循环用quit禁止continue |
| `s ind = $o(...)` | `s ind=$o(...)` | 赋值两边不能有空格 |
| `Set ind=$o(...)` | `s ind=$o(...)` | 命令必须缩写 |
| `Quit $$$OK` | `q $$$OK` | 命令必须缩写 |
| `Kill ^CacheTemp` | `k ^CacheTemp` | 命令必须缩写 |

---

## 四、参考示例

详见 IRIS 中实际代码：
```
web.DHCENS.BLL.BloodSugar.Interface.cls
```
