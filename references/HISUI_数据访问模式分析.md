---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: 7f0b7682b60c199ecc298a6256aae9de_d3f7f1ec5e9711f1bd025254006c9bbf
    ReservedCode1: PRBvINFNT99LQkQlJq1o/n5C+kD0/xg/nQbk/0351ycXjf7k2x9son6YGcqaV8CWD+aKoQXaSv5hLCOTrSL8ubScx4t0FQETCJoPVSCThwebmrkz6FxSdnTMP/PNHW4G15YWi2kpIySWf5Ao6QWf71rgDB0LWGfsi3THEQDWKPMAkGMhn2O80dpkWNA=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: 7f0b7682b60c199ecc298a6256aae9de_d3f7f1ec5e9711f1bd025254006c9bbf
    ReservedCode2: PRBvINFNT99LQkQlJq1o/n5C+kD0/xg/nQbk/0351ycXjf7k2x9son6YGcqaV8CWD+aKoQXaSv5hLCOTrSL8ubScx4t0FQETCJoPVSCThwebmrkz6FxSdnTMP/PNHW4G15YWi2kpIySWf5Ao6QWf71rgDB0LWGfsi3THEQDWKPMAkGMhn2O80dpkWNA=
---

# HISUI 数据访问模式分析

> 来源：http://hisui.cn/api/ 数据访问章节 | 分析日期：2026-06-02

---

## 一、核心 API

| API | 用途 | 返回值 |
|-----|------|--------|
| `$cm(data, success, error)` | 调用后台方法/Query | JSON 对象（自动 parse） |
| `$m(data, success, error)` | 调用后台方法 | 原始文本，不自动 parse |

## 二、安全过滤机制

框架在 ajax 层内置关键词过滤，命中以下关键词且**前后有特殊字符**时，请求值被置空：

**SQL 注入类**：`insert`, `select`, `delete`, `update`, `count`, `chr`, `declare`, `truncate`, `from`, `having`

**对象/参数类**：`base`, `object`, `param`, `script`, `noscript`

**XSS 事件类**：`alert`, `confirm`, `prompt`, `location`, `eval`, `function`, `onabort`, `onblur`, `onchange`, `onclick`, `ondblclick`, `onerror`, `onfocus`, `onkeydown`, `onkeypress`, `onkeyup`, `onload`, `onmousemove`, `onmouseover`, `onmouseout`, `onmousedown`, `onmouseup`, `onreset`, `onselect`, `onsubmit`, `onunload`, `onmouseleave`, `onmousewheel`

> **注意**：过滤仅针对**关键词前后有特殊字符**的情况，普通文本中的关键词不受影响。这是基于正则边界匹配，而非简单字符串包含。

## 三、data 参数结构

```javascript
$cm({
    ClassName:     "包名.类名",          // 必填
    MethodName:    "方法名",             // 与 QueryName 二选一
    QueryName:     "Query名",            // 与 MethodName 二选一（MethodName 优先）
    wantreturnval: 1,                   // 1=有返回值(do方式) 0=无返回值(set方式) 默认1
    ResultSetType: "array",             // array: [{},{},{}] | 不配: {"rows":[...],"total":N} | Excel: 导出CSV | ExcelPlugin: 本地Excel
    totalFields:   "amt,cost",          // 合计字段，逗号分隔
    totalFooter:   '"colName":"押金合计"', // 合计行前置字段
    dataType:      "json",              // 默认 json
    type:          "POST",              // 默认 POST
    page:          1,                   // Query 分页页码
    rows:          20,                  // Query 每页条数，默认 50
    // ... 其他自定义参数直接作为后台方法/Query 入参
})
```

## 四、调用模式矩阵

| 场景 | API | wantreturnval | 特点 |
|------|-----|---------------|------|
| 后台方法，返回 JSON | `$cm()` | 1（默认） | 自动 JSON.parse |
| 后台方法，返回非 JSON | `$m()` | 1（默认） | 原始文本 |
| 后台方法，无返回值 | `$cm()` | 0 | set 方式运行 |
| 后台 Query | `$cm()` | — | MethodName 不传 |
| 同步调用 | `$cm(data, false)` | — | **不推荐**，阻塞 UI |
| 卸载事件内请求 | `$cm({type:"BEACON"})` | — | Chrome 49+ 卸载时无回调 |

## 五、后台对应模式

### 5.1 类方法（MethodName）

```
后台 IRIS 类 → ClassMethod → 返回 JSON 字符串或对象
```

```objectscript
Class dhc.Test Extends %RegisteredObject 
{
ClassMethod getPatInfo(UserName As %String) [ Language = objectscript ]
{
    q "{""name"":"""_UserName_"""}"    ; 返回 JSON 字符串
}
}
```

### 5.2 Query（QueryName）

支持入参类型：`%String`、`%Integer`、`%Float`、`%Boolean`

```objectscript
Query LookUpActive(desc As %String) As %Library.SQLQuery
    (CONTAINID = 2, ROWSPEC = "Description:%String,HIDDEN:%Integer,Active:%Boolean")
{
    SELECT SSUSR_Name, SSUSR_RowID, SSUSR_Active
    FROM SQLUser.SS_User
    WHERE ((%ALPHAUP SSUSR_Name [ %ALPHAUP :desc) OR (:desc IS NULL))
        AND (SSUSR_Active = 'Y')
    ORDER BY SSUSR_Name
}
```

前端调用时 `desc` 自动映射为 Query 入参：

```javascript
$cm({
    ClassName: "web.SSUser",
    QueryName: "LookUpActive",
    desc: "张",      // → Query 入参 :desc
    page: 1,
    rows: 20
}, function(rs) {
    // rs = {"rows":[{...}],"total":110}
});
```

### 5.3 数组入参

```javascript
// JS 端数组
$cm({
    ClassName: "dhc.Test",
    MethodName: "saveFavFruitList",
    plist: ["orange", "apple", "pear", "banana"]
});
```

```objectscript
// 后台接收：plist(1)="orange", plist(2)="apple", plist(3)="pear", plist(4)="banana"
ClassMethod saveFavFruitList(plist) [ Language = objectscript ]
{
    ; plist 为 IRIS 下标数组
    quit "{}"
}
```

### 5.4 对象返回

```objectscript
ClassMethod getInfo() As dhc.Test [ Language = objectscript ]
{
    set obj = ##class(dhc.Test).%New()
    set obj.Name = "neer"
    set obj.Sex  = "男"
    quit obj    ; 框架自动序列化为 JSON
}
```

前端接收：`{Name: "neer", Sex: "男"}`

## 六、ResultSetType 决策树

```
ResultSetType 取值
├── 不配置（默认）
│   └── 返回 {"rows":[{},{},{}],"total":N}
│   └── 适用：datagrid / treegrid 直接加载
├── "array"
│   └── 返回 [{},{},{}]
│   └── 适用：combobox / combotree 数据源
├── "Excel"
│   └── 返回 CSV 下载链接
│   └── 适用：触发浏览器下载
└── "ExcelPlugin"
    └── 导出 Excel 到本地
    └── 适用：需要本地文件
```

## 七、项目中推荐实践

### 7.1 标准 Query 调用模式

```javascript
// 查询类页面：ResultSetType 不配置，走默认 rows+total 格式
$cm({
    ClassName: "web.DHCWLfeeSum",
    QueryName: "LookUpFeeSum",
    StartDate: startDate,      // Query 入参直接传
    EndDate:   endDate,
    page:      1,
    rows:      20
}, function(rs) {
    $('#dg').datagrid('loadData', rs);
});
```

### 7.2 combobox 数据源模式

```javascript
// 下拉框：使用 ResultSetType:"array" 获取扁平数组
$cm({
    ClassName: "web.SSUser",
    QueryName: "LookUpActive",
    ResultSetType: "array",
    desc: ""
}, function(data) {
    $('#userCombo').combobox('loadData', data);
});
```

### 7.3 合计行模式

```javascript
$cm({
    ClassName: "web.DHCWLfeeSum",
    QueryName: "LookUpFeeSum",
    totalFields: "Amt,Cost",       // 对 Amt 和 Cost 列求和
    totalFooter: '"FeeName":"合计"', // 合计行第一列显示"合计"
    StartDate: startDate,
    EndDate:   endDate
}, function(rs) {
    // rs.footer = [{"FeeName":"合计","Amt":1100,"Cost":520}]
    $('#dg').datagrid('loadData', rs);
});
```

### 7.4 写入操作模式

```javascript
// set 方式：wantreturnval:0
$cm({
    ClassName: "dhc.Bill",
    MethodName: "Save",
    wantreturnval: 0,
    BillNo:   billNo,
    BillData: billData
}, function(rtn) {
    $.messager.alert('提示', '保存成功');
});
```

### 7.5 BEACON 模式（页面卸载时）

```javascript
// 页面关闭前记录日志，用 BEACON 确保请求发出
$(window).on('beforeunload', function() {
    $cm({
        ClassName: "dhc.Log",
        MethodName: "RecordLeave",
        type: "BEACON",
        UserId: userId,
        Page:   location.href
    });
});
```

## 八、关键要点速查

| 要点 | 说明 |
|------|------|
| 依赖 | jQuery + websys.jquery.js（先 jQuery 后 websys） |
| 默认请求方式 | POST |
| 默认返回格式 | JSON（自动 parse） |
| Query 默认分页 | page=1, rows=50 |
| MethodName 优先 | 传了 MethodName 则 QueryName 无效 |
| 同步调用 | `$cm(data, false)` 第二个参数为 false |
| 安全过滤 | 正则边界匹配，非简单包含 |
| BEACON | Chrome 49+ 页面卸载场景专用 |
| 对象入参 | JS 对象直接传，后台对应 %RegisteredObject |
| 数组入参 | JS 数组直接传，后台对应下标数组 |
*（内容由AI生成，仅供参考）*
