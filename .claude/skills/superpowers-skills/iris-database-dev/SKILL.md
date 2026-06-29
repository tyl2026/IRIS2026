---
name: iris-database-dev
description: InterSystems IRIS 2021 原生数据库编程全流程指南。涵盖 CSP 页面开发、ObjectScript CLS 持久化类、%CSP.REST API、DDL 建表、ODBC 连接、中文 GBK 编码处理及常见陷阱。适用于中文 Windows 环境的 IRIS 开发。
---

# InterSystems IRIS 数据库编程开发指南

本 skill 提供 IRIS 2021 原生技术栈的完整开发指引，零外部依赖（不引入 Python / Node.js 中间层），目标部署环境为局域网。

## 适用场景

- 新建 IRIS CSP 页面（.csp 文件）
- 编写 ObjectScript CLS 持久化类（存储/查询数据）
- 创建 %CSP.REST 风格的 RESTful API
- 编写 DDL 建表语句
- 通过 ODBC 连接 IRIS 数据库（从外部应用）
- 处理中文输出与 GBK 编码问题
- 前端 HTML/JS 与后端 ObjectScript 交互

---

## 一、CSP 页面开发

### 1.1 基础结构

```html
<!-- mypage.csp -->
<html>
<head>
<script language="cache" runat="server">
    // 服务端 ObjectScript 代码
    Set msg = "Hello IRIS"
</script>
</head>
<body>
    <h1>#(msg)#</h1>
</body>
</html>
```

### 1.2 服务端脚本块

- 使用 `<script language="cache" runat="server">` 嵌入 ObjectScript
- 使用 `#(变量名)#` 在 HTML 中输出变量值
- 使用 `#(表达式)#` 输出表达式结果

### 1.3 中文输出（重要）

在中文 Windows / GBK 环境下，**必须**使用：

```objectscript
Write ##class(%CSP.Page).EscapeHTML("中文内容")
```

**禁止**使用 `$zconvert(v,"O","HTML")`，该函数在 GBK 环境下会导致 UTF-8 二次编码乱码。

### 1.4 前后端交互

前端 JS 调用后端方法（%CSP.REST 风格）：

**后端 ObjectScript（.cls 或 .csp 内嵌）：**
```objectscript
ClassMethod GetData() As %Status
{
    Set %response.ContentType = "application/json"
    Set data = {}
    Set data.name = "张三"
    Set data.value = 100
    Write data.%ToJSON()
    Quit $$$OK
}
```

**前端 JS：**
```javascript
fetch('/csp/dhc-app/mypage.csp/GetData')
    .then(r => r.json())
    .then(data => console.log(data));
```

---

## 二、ObjectScript CLS 持久化类

### 2.1 基础持久化类

```objectscript
Class DHC.APP.Patient Extends %Persistent
{
Property Name As %String(MAXLEN = 100);
Property Age As %Integer;
Property CreateDate As %Date;

Index NameIdx On Name;
Index DateIdx On CreateDate;

Storage Default
{
<Data name="PatientDefaultData">
<Value name="1">
<Value>%%CLASSNAME</Value>
</Value>
<Value name="2">
<Value>Name</Value>
</Value>
<Value name="3">
<Value>Age</Value>
</Value>
<Value name="4">
<Value>CreateDate</Value>
</Value>
</Data>
<DataLocation>^DHC.APP.PatientD</DataLocation>
<DefaultData>PatientDefaultData</DefaultData>
<IdLocation>^DHC.APP.PatientD</IdLocation>
<IndexLocation>^DHC.APP.PatientI</IndexLocation>
<StreamLocation>^DHC.APP.PatientS</StreamLocation>
<Type>%Storage.Persistent</Type>
}
}
```

### 2.2 CRUD 操作

```objectscript
// 创建
Set obj = ##class(DHC.APP.Patient).%New()
Set obj.Name = "张三"
Set obj.Age = 35
Set obj.CreateDate = +$H
Set sc = obj.%Save()

// 查询（按 ID）
Set obj = ##class(DHC.APP.Patient).%OpenId(id)

// 查询（按索引）
Set rs = ##class(DHC.APP.Patient).NameIdxOpen("张三")
While rs.%Next() {
    Set obj = ##class(DHC.APP.Patient).%OpenId(rs.Data("ID"))
    Write obj.Name, !
}

// 更新
Set obj.Name = "李四"
Set sc = obj.%Save()

// 删除
Set sc = ##class(DHC.APP.Patient).%DeleteId(id)
```

---

## 三、%CSP.REST API 开发

### 3.1 REST 类结构

```objectscript
Class DHC.APP.REST.Patient Extends %CSP.REST
{
Parameter HandleCorsRequest = 1;

XData UrlMap [ XMLNamespace = "http://www.intersystems.com/urlmap" ]
{
<Routes>
<Route Url="/patient/:id" Method="GET" Call="GetPatient"/>
<Route Url="/patient" Method="POST" Call="CreatePatient"/>
<Route Url="/patient/:id" Method="PUT" Call="UpdatePatient"/>
<Route Url="/patient/:id" Method="DELETE" Call="DeletePatient"/>
<Route Url="/patient/list" Method="GET" Call="ListPatients"/>
</Routes>
}

ClassMethod GetPatient(id As %String) As %Status
{
    Set obj = ##class(DHC.APP.Patient).%OpenId(id)
    If '$IsObject(obj) {
        Set %response.Status = 404
        Write {"error":"Not found"}.%ToJSON()
        Quit $$$OK
    }
    Set data = {}
    Set data.id = id
    Set data.name = obj.Name
    Set data.age = obj.Age
    Write data.%ToJSON()
    Quit $$$OK
}
}
```

### 3.2 CORS 配置

```objectscript
Parameter HandleCorsRequest = 1;
```

自动处理 OPTIONS 预检请求，适用于前后端分离场景。

---

## 四、DDL 建表（标准 SQL）

IRIS 2021 支持标准 SQL DDL，可直接通过 SQL 管理门户或 JDBC/ODBC 执行：

```sql
CREATE TABLE DHC_APP.PatientAssessment (
    ID              BIGINT IDENTITY PRIMARY KEY,
    PatientName     NVARCHAR(100),
    Score           INT,
    AssessmentData  NVARCHAR(MAX),
    CreateDate      DATETIME DEFAULT GETDATE(),
    CreateUser      NVARCHAR(50)
);

CREATE INDEX IX_PatientAssessment_Date ON DHC_APP.PatientAssessment(CreateDate);
```

### 注意事项

- 表名中使用 `_` 分隔 schema 和表名（`DHC_APP.TableName`）
- `NVARCHAR` / `NVARCHAR(MAX)` 用于 Unicode 中文存储
- `IDENTITY` 用于自增主键
- DDL 语法与标准 SQL 基本一致

---

## 五、ODBC 连接

### 5.1 DSN 配置

- DSN 名称：`IRIS`
- 连接字符串：`DSN=IRIS;UID=_SYSTEM;PWD=xxx;NAMESPACE=DHC-APP`

### 5.2 外部应用连接示例

**Python (pyodbc)：**
```python
import pyodbc
conn = pyodbc.connect('DSN=IRIS;UID=_SYSTEM;PWD=xxx;NAMESPACE=DHC-APP')
cursor = conn.cursor()
cursor.execute("SELECT * FROM DHC_APP.PatientAssessment")
rows = cursor.fetchall()
```

---

## 六、关键陷阱与最佳实践

### 6.1 ObjectScript 分号陷阱

`;` 是**单行注释**起始符，不能在同一行内分隔多条语句：

```objectscript
// 错误：分号后的所有内容被当作注释
Set a = 1; Set b = 2

// 正确：分行书写
Set a = 1
Set b = 2

// 或同一行用空格分隔
Set a = 1  Set b = 2
```

编译器会将 `;` 之后的内容全部忽略，可能导致括号不匹配报错 `#1025: Expected end of line`。

### 6.2 中文输出规则

- CSP 页面输出中文：**只用** `##class(%CSP.Page).EscapeHTML()`
- JSON 响应中文：设置 `%response.ContentType = "application/json; charset=UTF-8"`
- 禁止 `$zconvert(v,"O","HTML")`，避免 GBK 二次编码乱码

### 6.3 零外部依赖原则

CSP 页面中所有功能通过嵌入式 ObjectScript 和原生 HTML/JS 实现，不引入 Python / Node.js / 外部中间层。

### 6.4 JSON 构建

使用 IRIS 内置 `%DynamicObject` / `%DynamicArray`：

```objectscript
Set obj = {}
Set obj.name = "张三"
Set obj.items = []
Do obj.items.%Push("A")
Do obj.items.%Push("B")
Write obj.%ToJSON()
```

### 6.5 日期处理

```objectscript
// 当前日期（$H 格式）
Set today = +$H

// $H 转显示格式
Write $ZD(today, 3)   // 2026-05-31

// 显示格式转 $H
Set hDate = $ZDH("2026-05-31", 3)
```

---

## 七、ObjectScript 代码规范（写入时强制遵循）

生成任何 .cls / .csp / .mac / .int 文件中的 ObjectScript 代码时，必须严格遵守以下规范，确保代码风格统一。

### 7.1 变量命名

| 规则 | 正确 | 错误 |
|------|------|------|
| 变量名 lowerCamelCase | `startDate` | `startdate` |
| 常量全大写 | `MAXCOUNT` | `MaxCount` |
| 布尔变量 Flag 后缀 | `dispFlag` | `isDisp` |
| Global 临时数据 | `^CacheTemp*` | `^TEMP*` / `^Temp*` |
| 进程 Global | `^||TMP`，节点带 pid | — |

### 7.2 方法命名

- 方法名 UpperCamelCase，动宾结构：`GetName()`、`QueryData()`
- 布尔方法 `Is` 开头 + `As %Boolean`：`IsExist() As %Boolean`
- 方法不超过 50 行；参数过多用对象重构
- 禁止循环内写 `&sql()`，SQL 单独建类

### 7.3 命令与函数缩写

| 类型 | 全拼 | 缩写 |
|------|------|------|
| 命令 | set / do / quit / kill / new / write | s / d / q / k / n / w |
| 命令（保持全拼） | for / while / if / elseif / else / continue | 不缩写 |
| 事务 | tstart / tcommit / trollback | ts / tc / tro |
| 锁 | lock | l |
| 函数 | $extract / $piece / $length / $order / $get / $data | $e / $p / $l / $o / $g / $d |
| 函数 | $zconvert / $zhex / $zdate / $ztime | $zcvt / $zh / $zd / $zt |

### 7.4 格式规范

- 方法大括号换行显示：
```objectscript
ClassMethod Foo() As %Status
{
    s a = 1
    q $$$OK
}
```
- 运算符两侧加空格：`s a = b + c`
- 逗号后加空格：`$lb(0, repid, 0)`
- 缩进用 1 个 Tab（4 空格）
- SQL 一行 5 字段，换行后 3 Tab 缩进，逗号在行末
- 单行字符串拼接不超过 5 个字段

### 7.5 后置表达式（关键）

多条件后置表达式括号内运算符加空格，括号与 `&&`/`||` 之间**无空格**：
```objectscript
// 正确
q:(a = "")&&(b = "")&&(c = "")
continue:(hospId '= "")&&(locId > 0)

// 错误（会导致编译错误）
q:(a = "") && (b = "") && (c = "")
```

### 7.6 控制结构

- `if` 语句换行写，嵌套不超过 3 层
- 逻辑运算统一用 `&&`、`||`
- `} else {` 写在同一行
- 后置表达式加括号

### 7.7 事务与锁

- 事务简写小写：`ts`、`tc`、`tro`，首尾加空行或注释
- 事务必须在同一方法内闭合，同一屏幕范围
- 加锁带 `+` 和超时：`l +^XXX("data"):3`
- 解锁带 `-`：`l -^XXX("data")`
- 加解锁必须成对出现

### 7.8 注释

- 单行用 `#;`，句尾用 `//`
- 类/方法头用 `///`
- 类头：`/// desc:` / `/// author:` / `/// date:`
- 方法头：`/// desc:` / `/// params:` / `/// return:` / `/// debug:`

### 7.9 错误处理

- 禁止返回裸负数
- 字符串格式：`负数^错误信息`
- %Status 格式：`$$$ERROR($$$GeneralError,"错误信息")`

---

## 八、开发工作流

1. **需求分析**：明确数据结构、API 端点、前端交互
2. **持久化类**：先定义 CLS 持久化类或 DDL 建表
3. **CSP 页面**：编写 .csp 文件，内嵌 HTML + JS + ObjectScript（代码写入时遵循第七节规范）
4. **API 端点**：如需 RESTful，编写 %CSP.REST 子类
5. **代码校验**：所有 .cls / .csp / .js 文件写入磁盘后，**必须在返回结果中明确提示主 Agent** 调用 `iris-code-formatter` skill 对生成的文件进行代码规范审查
6. **测试**：通过 SQL 管理门户或前端 fetch 调用验证
7. **部署**：将 .csp / .cls 文件编译导入目标 IRIS 实例

---

## 九、自动校验规则（强制）

**当本 skill 完成 .cls / .csp / .js / .mac / .int 文件的生成或修改后，必须在返回结果的末尾加入以下提示：**

> 请调用 `iris-code-formatter` skill 对以下文件进行代码规范校验：[列出文件路径]

此规则确保每次生成 IRIS 代码后都自动触发格式审查，无例外。
