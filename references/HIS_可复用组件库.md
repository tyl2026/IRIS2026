# IRIS HIS 通用可复用组件库

> 适用：IRIS for Health + CSP + HISUI (EasyUI) + jQuery 1.11
> 约束：IE11 ES5 兼容 / $.cm() 交互 / Global 数据
> 更新：2026-07-04

---

## 1. 动态字段选择器

**功能**：弹出式多选面板，分组展示数百字段，支持搜索和拖拽排序。

### 使用场景

- 任何需要从大量字段中选择输出列的场景（报表、导出配置）
- 字段数 > 50 且需要分组浏览

### 核心代码

```javascript
// ====== 数据结构 ======
// FIELD_META: [{field, title, type, piece, group}, ...] — 从后端 GetFieldMeta() 获取
// FIELD_GROUPS: ["基本信息","住院信息",...] — 从 FIELD_META 去重提取
// DEFAULT_FIELDS: 默认选中列 [{field, title, piece, type, group}, ...] — type 必填

// ====== 分组 tabs ======
function buildGroupTabs() {
    var html = "";
    for (var g = 0; g < FIELD_GROUPS.length; g++) {
        html += '<a class="group-tab" data-group="' + FIELD_GROUPS[g] + '"'
             + ' onclick="switchFieldGroup(this)">' + FIELD_GROUPS[g] + "</a>";
    }
    $("#groupTabs").html(html);
}

// ====== 字段树渲染（搜索 -> 跨组，否则 -> 单组） ======
function renderFieldTreeByGroup(group) {
    var q = ($("#fieldSearch").val() || "").toLowerCase();
    var html = "";
    for (var g = 0; g < FIELD_GROUPS.length; g++) {
        var gname = FIELD_GROUPS[g];
        if (!q && gname !== group) continue;
        html += '<div class="group-header">' + gname + "</div>";
        for (var i = 0; i < FIELD_META.length; i++) {
            var f = FIELD_META[i];
            if (f.group !== gname) continue;
            if (q && f.title.toLowerCase().indexOf(q) === -1
                 && f.field.toLowerCase().indexOf(q) === -1) continue;
            var checked = isFieldSelected(f.field) ? " checked" : "";
            html += '<label><input type="checkbox" value="' + f.field + '"'
                 + checked + ' onclick="onFieldCheck(this)"> ' + f.title + "</label>";
        }
    }
    $("#fieldTree").html(html);
}

// ====== 拖拽排序 (IE11 原生 HTML5 Drag API) ======
var dragField = "";
function onDragStart(e) {
    e = e || window.event;
    dragField = e.target.getAttribute("data-field") || "";
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text", dragField);
    e.target.style.opacity = "0.4";
}
function onDragEnd(e) {
    e = e || window.event; e.target.style.opacity = "1"; dragField = "";
}
function onDragOver(e) {
    e = e || window.event; e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (e.target.className.indexOf("sel-item") === -1) return;
    e.target.style.borderTop = "2px solid #017bce";
}
function onDragLeave(e) {
    e = e || window.event;
    if (e.target.className.indexOf("sel-item") === -1) return;
    e.target.style.borderTop = "";
}
function onDrop(e) {
    e = e || window.event; e.preventDefault();
    var toField = e.target.getAttribute("data-field") || "";
    var fromField = e.dataTransfer.getData("text") || dragField;
    if (!fromField || !toField || fromField === toField) return;
    var fromIdx = -1, toIdx = -1;
    for (var m = 0; m < selectedFields.length; m++) {
        if (selectedFields[m].field === fromField) fromIdx = m;
        if (selectedFields[m].field === toField) toIdx = m;
    }
    var item = selectedFields.splice(fromIdx, 1)[0];
    selectedFields.splice(toIdx, 0, item);
    dragField = "";
    rebuildSelector();
}
```

### 弹窗 HTML 模板

```html
<div id="dlgFields" class="hisui-dialog" data-options="closed:true,title:'选择字段',width:750,height:500,modal:true">
    <div style="display:flex;gap:10px;padding:10px">
        <div style="flex:1">
            <input id="fieldSearch" placeholder="搜索..." onkeyup="renderFieldTreeByGroup('')">
            <div id="groupTabs"></div>
            <div id="fieldTree" style="overflow:auto;border:1px solid #d0dcee;height:350px"></div>
        </div>
        <div style="width:220px">
            <div style="font-weight:600;font-size:12px">已选字段（拖拽排序）</div>
            <div id="selectedList" style="overflow:auto;border:1px solid #d0dcee;height:350px"></div>
            <div id="selectedCount">已选 0 项</div>
        </div>
    </div>
    <div style="text-align:right;padding:8px;border-top:1px solid #ddd">
        <a class="hisui-linkbutton" onclick="selectAll()">全选</a>
        <a class="hisui-linkbutton" onclick="invert()">反选</a>
        <a class="hisui-linkbutton" onclick="confirm()">确定</a>
    </div>
</div>
```

### 接入步骤

1. 后端实现 `GetFieldMeta()` 返回字段元数据 JSON
2. 定义 `DEFAULT_FIELDS`（每个必含 `type` 属性）
3. 复制上述 JS 代码，改 `#dlgFields`、`#fieldTree` 等 ID 为实际值
4. `confirm()` 回调中处理 `selectedFields`

---

## 2. 动态条件引擎

**功能**：用户自由添加查询条件行，字段类型自动决定运算符和输入控件，支持 AND/OR 分组。

### 使用场景

- 任何需要灵活筛选条件的查询/报表页面
- 字段类型多样（字符串/日期/数字/科室/性别），需要不同输入控件

### 核心代码

```javascript
// ====== 添加条件行 ======
function addCondition(groupId) {
    var idx = $("#condList" + groupId).children().length;
    var html = '<div class="cond-row" data-group="' + groupId + '">';
    if (idx > 0) html += '<select class="cond-logic"><option>AND</option><option>OR</option></select>';
    html += '<input class="cond-field hisui-combobox" style="width:160px">';
    html += '<select class="cond-op" style="width:90px"></select>';
    html += '<span class="cond-value"></span>';
    html += '<a onclick="removeCond(this)" style="color:#f66;cursor:pointer">x</a>';
    html += "</div>";
    $("#condList" + groupId).append(html);
    // 初始化 combobox
    $("#condList" + groupId + " .cond-field").last().combobox({...});
}

// ====== 字段选择 -> 运算符切换 ======
function onCondFieldChange(el, rec) {
    var fieldType = (rec ? rec.value : $(el).combobox("getValue")).split("|")[1];
    var ops = (fieldType === "Date" || fieldType === "Number")
        ? [{v:"eq",l:"等于"},{v:"neq",l:"不等于"},{v:"gt",l:"大于"},
           {v:"gte",l:"大于等于"},{v:"lt",l:"小于"},{v:"lte",l:"小于等于"},{v:"between",l:"区间"}]
        : [{v:"contains",l:"包含"},{v:"notcontains",l:"不包含"},{v:"startswith",l:"左匹配"}];
    var html = ops.map(function(o){return '<option value="'+o.v+'">'+o.l+'</option>';}).join("");
    $(el).closest(".cond-row").find(".cond-op").html(html).trigger("change");
}

// ====== 运算符 -> 输入控件切换 ======
function onCondOpChange(row) {
    var op = row.find(".cond-op").val();
    var fieldType = row.find(".cond-field").combobox("getValue").split("|")[1];
    var isDate = (fieldType === "Date");
    if (op === "between") {
        row.find(".cond-value").html(
            '<input class="cond-val1' + (isDate?" hisui-datebox":"") + '"> ~ '
          + '<input class="cond-val2' + (isDate?" hisui-datebox":"") + '">');
    } else {
        row.find(".cond-value").html(
            '<input class="cond-val1' + (isDate?" hisui-datebox":"") + '">');
    }
    if (isDate) {
        row.find(".cond-val1").datebox({editable:false});
        if (op === "between") row.find(".cond-val2").datebox({editable:false});
    }
}

// ====== 收集条件 ======
function collectConditions() {
    var conds = [];
    $("#condContainer .cond-group").each(function(gi) {
        $(this).find(".cond-row").each(function() {
            var v1 = $(this).find(".cond-val1");
            var v2 = $(this).find(".cond-val2");
            var isDate = v1.hasClass("hisui-datebox");
            var val1 = isDate ? v1.datebox("getValue") : v1.val();
            var val2 = v2.length ? (isDate ? v2.datebox("getValue") : v2.val()) : "";
            conds.push({
                field: $(this).find(".cond-field").combobox("getValue").split("|")[0],
                op: $(this).find(".cond-op").val(),
                value: op === "between" ? val1 + "~" + val2 : val1,
                logic: $(this).find(".cond-logic").val() || "AND",
                groupId: gi
            });
        });
    });
    return conds;
}
```

### 条件组 HTML 模板

```html
<div id="condContainer">
    <div id="condGroup0" class="cond-group">
        <div class="group-label">条件组 1</div>
        <div id="condList0"></div>
    </div>
</div>
<div style="margin-top:6px">
    <a onclick="addConditionGroup()">+ 添加条件组</a>
    <a onclick="addCondition()">+ 添加条件</a>
</div>
```

### 运算符规则

| 字段类型 | 运算符                             | 输入控件                |
| -------- | ---------------------------------- | ----------------------- |
| String   | contains, notcontains, startswith  | `<input>`             |
| Date     | eq, neq, gt, gte, lt, lte, between | `datebox`（单/双）    |
| Number   | eq, neq, gt, gte, lt, lte, between | `<input>`             |
| CTLoc    | contains, notcontains, startswith  | `<input>`（输入描述） |
| Gender   | contains, notcontains, startswith  | `<input>`             |

### 后端分组匹配逻辑

```objectscript
// 按 groupId 分组（组内 AND，组间 OR）
s groupCnt = $l(groupList, ",")
for gi = 1:1:groupCnt {
    s allPass = 1
    s condCnt = $l(groups(gid), sep)
    for ci = 1:1:condCnt {
        s condStr = $p(groups(gid), sep, ci)
        s field  = $p(condStr, "|", 1)
        s op     = $p(condStr, "|", 2)
        s value  = $p(condStr, "|", 3)
        s piece  = +$p(condStr, "|", 4)
        s ftype  = $p(condStr, "|", 5)
        s actualVal = $p(data, "^", piece)
        if '..MatchValue(actualVal, op, value, ftype) s allPass = 0 q
    }
    if allPass s groupMatch = 1 q   // 任一组通过 = 命中
}
```

---

## 3. MatchValue 通用比较器

**功能**：将用户输入值与 Global 实际值比较，支持 10 种运算符 + 5 种类型自动处理。

### 完整代码（复制即用）

```objectscript
/// @param actualVal  从 Global $p 提取的原始值
/// @param op         运算符: contains|notcontains|startswith|eq|neq|gt|gte|lt|lte|between
/// @param condVal    用户输入值
/// @param ftype      类型: String|Date|Number|CTLoc|Gender
/// @return           %Boolean
ClassMethod MatchValue(actualVal As %String, op As %String, condVal As %String, ftype As %String = "String") As %Boolean
{
    // ── 类型预处理 ──
    if ftype = "CTLoc" s actualVal = $p($g(^CTLOC(+actualVal)), "^", 2)

    // ── 字符串运算符 ──
    if op = "contains"    q ($find(actualVal, condVal) > 0)
    if op = "notcontains" q ($find(actualVal, condVal) = 0)
    if op = "startswith"  q ($e(actualVal, 1, $l(condVal)) = condVal)

    // ── 比较运算符 ──
    if ftype = "Date" { s condVal = $zdh(condVal, 3) }  // 用户输入 -> $H

    if op = "eq"      q (actualVal = condVal)
    if op = "neq"     q (actualVal '= condVal)
    if op = "gt"      q (actualVal > condVal)
    if op = "lt"      q (actualVal < condVal)
    if op = "gte"     q (actualVal '< condVal)
    if op = "lte"     q (actualVal '> condVal)
    if op = "between" {
        s v1 = $p(condVal, "~", 1), v2 = $p(condVal, "~", 2)
        if ftype = "Date" { s v1 = $zdh(v1, 3), v2 = $zdh(v2, 3) }
        q (actualVal '< v1)&&(actualVal '> v2)
    }
    q 1
}
```

### 调用方式

```objectscript
// 单 piece 字段
s actualVal = $p(rowData, "^", piece)

// 聚合字段
if piece < 0 s actualVal = ..BuildMultiPiece(rowData, piece)

// 条件比较
if '..MatchValue(actualVal, op, condVal, ftype) continue
```

### 扩展新类型

```objectscript
// 在方法顶部类型预处理区添加：
if ftype = "XXX" s actualVal = $$CustomConvert(actualVal)
```

---

## 4. 模板系统

**功能**：保存/加载用户配置，支持个人/通用范围、权限控制、SQL 查询。

### 存储格式

```objectscript
^TemplateGlobal(id) = $lb(
    "ClassName",    // 1. %%CLASSNAME
    "模板名称",      // 2. Name
    "G",            // 3. Scope (G=通用 P=个人)
    "userid",       // 4. CreateUserID
    "[{...}]",      // 5. ConfigJSON1 (如输出列)
    "[{...}]",      // 6. ConfigJSON2 (如查询条件)
    0,              // 7. IsDefault
    1,              // 8. IsActive
    +$h,            // 9. CreateDate
    +$p($h,",",2)   // 10. CreateTime
)
```

### 持久类（SQL 双通道）

```objectscript
Class YourNS.ConfigTemplate Extends %Persistent
    [ SqlRowIdName = CFG_Rowid, SqlTableName = Config_Template ]
{
Property Name As %String(MAXLEN = 100, MINLEN = 4) [ Required, SqlColumnNumber = 2 ];
Property Scope As %String(MAXLEN = 1, VALUELIST = ",G,P") [ Required, SqlColumnNumber = 3 ];
Property CreateUserID As %String [ SqlColumnNumber = 4 ];
Property ConfigJSON1 As %String(MAXLEN = "") [ Required, SqlColumnNumber = 5 ];
Property ConfigJSON2 As %String(MAXLEN = "") [ Required, SqlColumnNumber = 6 ];
Property IsDefault As %Boolean [ SqlColumnNumber = 7 ];
Property IsActive As %Boolean [ SqlColumnNumber = 8 ];
Property CreateDate As %Date [ SqlColumnNumber = 9 ];
Property CreateTime As %Time [ SqlColumnNumber = 10 ];

Storage Default {
<Data name="DefaultData">
<Value name="1"><Value>%%CLASSNAME</Value></Value>
<Value name="2"><Value>Name</Value></Value>
<Value name="3"><Value>Scope</Value></Value>
<Value name="4"><Value>CreateUserID</Value></Value>
<Value name="5"><Value>ConfigJSON1</Value></Value>
<Value name="6"><Value>ConfigJSON2</Value></Value>
<Value name="7"><Value>IsDefault</Value></Value>
<Value name="8"><Value>IsActive</Value></Value>
<Value name="9"><Value>CreateDate</Value></Value>
<Value name="10"><Value>CreateTime</Value></Value>
</Data>
<DataLocation>^YourGlobal</DataLocation>
<IdLocation>^YourGlobal</IdLocation>
<SqlRowIdName>CFG_Rowid</SqlRowIdName>
<Type>%Storage.Persistent</Type>
}
}
```

### 权限控制

```objectscript
// 编辑：非创建者锁定名称和范围
if creator '= UserID {
    s Name = $lg(data, 2)
    s Scope = $lg(data, 3)
}

// 删除：创建者 OR 指定部门
if (creator '= UserID) && (dept '= "医务部") && (dept '= "网络信息部") {
    q "{""ok"":false,""error"":""无权限""}"
}
```

### 模板恢复（setTimeout 级联）

```javascript
function restoreTemplate(configs) {
    for (var i = 0; i < configs.length; i++) {
        var row = /* 添加条件行 */;
        // 150ms: 设置字段 combobox
        setTimeout(function(r, val) {
            r.find(".cond-field").combobox("setValue", val).trigger("onSelect");
        }, 150, row, configs[i].fieldVal);
        // 350ms: 设置运算符
        setTimeout(function(r, op) {
            r.find(".cond-op").val(op).trigger("change");
        }, 350, row, configs[i].op);
        // 600ms: 填充值
        setTimeout(function(r, val) {
            var isDate = r.find(".cond-val1").hasClass("hisui-datebox");
            isDate ? r.find(".cond-val1").datebox("setValue", val)
                   : r.find(".cond-val1").val(val);
        }, 600, row, configs[i].value);
    }
}
```

### SQL 双通道检查清单

1. 显式 `Storage`：`DataLocation` + `IdLocation`（均 root）
2. `IdLocation` 禁止 subscript 0：`$i(^Global)` 非 `$i(^Global(0))`
3. Data 段：每个 property 精确映射 piece
4. Property：`SqlColumnNumber` + `SqlFieldName`
5. Class：`SqlRowIdName` + `SqlTableName`
6. `$lb` 位置：1=`%%CLASSNAME`，属性从 2 开始
7. 数值写入前 `+` 强转：`+$p($h,",",2)`

---

## 5. 类型转换链

**功能**：Global 原始值自动转换为可读格式（日期、科室名、性别等）。

### 转换代码

```objectscript
// === 取值 ===
if piece < 0 {
    s val = ..BuildMultiPiece(rowData, piece)   // 聚合字段
} else {
    s val = $p(rowData, "^", piece)
}
if val = "" s val = "-"

// === 转换 ===
if type = "Date" {
    if +val > 0 s val = $zd(+val, 3)            // $H -> yyyy-MM-dd
}
if type = "CTLoc" {
    s desc = $p($g(^CTLOC(+val)), "^", 2)       // ID -> 科室名
    if desc '= "" s val = desc
}
if type = "Gender" {
    if val = "1" s val = "男"
    if val = "2" s val = "女"
}
```

### 类型速查

| type       | 存储值       | 展示值     | 转换函数                         |
| ---------- | ------------ | ---------- | -------------------------------- |
| Date       | 67761        | 2026-04-01 | `$zd(+val, 3)`                 |
| Date(条件) | "2026-04-01" | 67761      | `$zdh(condVal, 3)`             |
| CTLoc      | 35           | 内科       | `$p(^CTLOC(+val),"^",2)`       |
| Gender     | 1/2          | 男/女      | 直接映射                         |
| MultiPiece | -1           | 拼接字符串 | `BuildMultiPiece(data, piece)` |

### MultiPiece 实现

```objectscript
ClassMethod BuildMultiPiece(data As %String, piece As %Integer) As %String
{
    s result = ""
    // 示例：piece=-1 拼接所有诊断
    if piece = -1 {
        for p = 52,56,60,64,68,72,76,80,84,88,92,96,100,104,108,112 {
            s result = result _ $p(data, "^", p) _ " "
        }
    }
    q $zstrip(result, "<>W")
}
```

### 关键陷阱

| 陷阱                                                                  | 原因                  | 修复                                     |
| --------------------------------------------------------------------- | --------------------- | ---------------------------------------- |
| $p 返回字符串 | `$p($h,",",2)` = `"81923"` | `+$p($h,",",2)` 强转 |                       |                                          |
| $zd 参数需数字 | $p 返回值是字符串                                    | `$zd(+val, 3)`      |                                          |
| Global 名错误                                                         | `^CT("LOC")` 不存在 | `^CTLOC`                               |
| $lb 计数器位置 | subscript (0) 非 $lb                                 | `$i(^Global)` root  |                                          |
| type 缺失                                                             | DEFAULT_FIELDS/旧模板 | `buildColumnsWithType()` 查 FIELD_META |

---

## 6. 日期快捷筛选 + 科室检索

**功能**：报表页面顶部统一的检索栏，包含日期快捷预设按钮（本月/本季/本年/去年）+ 自定义日期范围选择 + 科室下拉检索 + 查询/导出/清空操作按钮。

### 使用场景
- 任何需要按日期范围和科室筛选的统计报表页面
- 病案统计、费用统计、工作量统计等

### HTML 模板

```html
<div class="filter-bar">
    <label>日期</label>
    <span class="date-presets">
        <a class="date-preset active" data-preset="month" onclick="setDatePreset('month')">本月</a>
        <a class="date-preset" data-preset="quarter" onclick="setDatePreset('quarter')">本季</a>
        <a class="date-preset" data-preset="year" onclick="setDatePreset('year')">本年</a>
        <a class="date-preset" data-preset="lastyear" onclick="setDatePreset('lastyear')">去年</a>
    </span>
    <span class="vt-sep"></span>
    开始:<input id="dtStt" class="hisui-datebox" style="width:120px">
    结束:<input id="dtEnd" class="hisui-datebox" style="width:120px">
    <span class="vt-sep"></span>
    <label>科室</label><input id="selDept" class="hisui-combobox" style="width:160px">
    <a class="hisui-linkbutton" onclick="doQuery()" data-options="iconCls:'icon-search'">查询</a>
    <a class="hisui-linkbutton" onclick="doExport()" data-options="iconCls:'icon-w-export'">导出</a>
    <a class="hisui-linkbutton" onclick="doClear()" data-options="iconCls:'icon-clear'">清空</a>
</div>
```

### CSS

```css
.filter-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    background: #F9FBFF;
    border-bottom: 2px solid #95B8E7;
    flex-wrap: wrap;
}
.filter-bar label { font-size: 13px; color: #333; white-space: nowrap; }
.date-presets { display: inline-flex; gap: 4px; margin-right: 4px; }
.date-preset {
    cursor: pointer;
    padding: 3px 10px;
    border: 1px solid #95B8E7;
    border-radius: 4px;
    background: #fff;
    font-size: 12px;
    color: #017bce;
}
.date-preset:hover { background: #eaf2ff; }
.date-preset.active {
    background: #017bce;
    color: #fff;
    border-color: #017bce;
}
.vt-sep {
    width: 1px;
    height: 20px;
    background: #d0dcee;
    margin: 0 4px;
}
```

### JavaScript

```javascript
// ====== 初始化 ======
function initFilterBar() {
    // datebox 必须先显式初始化，否则 setValue 报错
    $('#dtStt').datebox({});
    $('#dtEnd').datebox({});

    // 默认日期：本月
    setDatePreset('month');

    // 科室 combobox（使用 ctloclookupNew 查询）
    var hospid = (typeof session !== 'undefined' && session['LOGON.HOSPID']) || '';
    $.q({
        ClassName: 'web.DHCExamPatList',
        QueryName: 'ctloclookupNew',
        desc: '', hospid: hospid,
        rows: 99999
    }, function (data) {
        $('#selDept').combobox({
            valueField: 'ctlocid',
            textField: 'ctloc',
            editable: true,
            data: data.rows || data,
            filter: function (q, row) {
                var ct = (row.ctloc || row.ctlocid || '').toUpperCase();
                var al = (row.Alias || '').toUpperCase();
                return ct.indexOf(q.toUpperCase()) >= 0
                    || al.indexOf(q.toUpperCase()) >= 0;
            }
        });
    });
}

// ====== 日期预设 ======
var gv = { activePreset: 'month' };

function setDatePreset(preset) {
    gv.activePreset = preset;

    var now = new Date();
    var start = new Date();
    var end = new Date();

    switch (preset) {
        case 'today':
            break;
        case 'week':
            start.setDate(now.getDate() - 7);
            break;
        case 'month':
            start.setDate(1);       // 本月第一天
            break;
        case 'quarter':
            var qm = Math.floor(now.getMonth() / 3) * 3;
            start = new Date(now.getFullYear(), qm, 1);
            break;
        case 'year':
            start = new Date(now.getFullYear(), 0, 1);
            break;
        case 'lastyear':
            start = new Date(now.getFullYear() - 1, 0, 1);
            end = new Date(now.getFullYear() - 1, 11, 31);
            break;
    }

    $('#dtStt').datebox('setValue', formatDate(start));
    $('#dtEnd').datebox('setValue', formatDate(end));

    // 高亮当前预设按钮
    var btns = document.querySelectorAll('.date-preset');
    for (var i = 0; i < btns.length; i++) { btns[i].classList.remove('active'); }
    var el = document.querySelector('.date-preset[data-preset="' + preset + '"]');
    if (el && el.classList) { el.classList.add('active'); }
}

// ====== 格式化日期 ======
function formatDate(d) {
    var y = d.getFullYear();
    var m = ("0" + (d.getMonth() + 1)).slice(-2);
    var day = ("0" + d.getDate()).slice(-2);
    return y + "-" + m + "-" + day;
}

// ====== 查询 ======
function doQuery() {
    var sttDate = $('#dtStt').datebox('getValue') || '';
    var endDate = $('#dtEnd').datebox('getValue') || '';
    var locID = $('#selDept').combobox('getValue') || '';

    if (!sttDate || !endDate) {
        $.messager.alert('提示', '请选择日期范围', 'info');
        return;
    }

    // 调后端查询，传入 sttDate, endDate, locID
    $cm({
        ClassName: 'YourClass',
        MethodName: 'YourMethod',
        SttDate: sttDate,
        EndDate: endDate,
        LocID: locID,
        wantreturnval: 1
    }, function(data) {
        // 渲染结果...
    });
}

// ====== 清空 ======
function doClear() {
    $('#dtStt').datebox('clear');
    $('#dtEnd').datebox('clear');
    $('#selDept').combobox('clear');
}
```

### 接入步骤

1. **复制 HTML** — 将 filter-bar 放入页面的 north 区域或顶部 div
2. **复制 CSS** — 将样式加入页面的 `<style>` 块
3. **复制 JS** — 将 `initFilterBar`、`setDatePreset`、`formatDate`、`doQuery`、`doClear` 放入 JS 文件
4. **替换科室查询** — 如果项目有自定义科室查询接口，替换 `$.q` 调用中的 `ClassName` 和 `QueryName`
5. **替换 doQuery** — 将 `YourClass.YourMethod` 替换为实际后端方法，传入 `SttDate/EndDate/LocID`
6. **可扩展预设** — 在 `switch` 中增加更多预设（如 `today`、`halfyear`），在 HTML 中增加对应按钮

### 关键注意事项

- `datebox` 必须先 `$('#dtStt').datebox({})` 初始化，再调 `setValue`
- `combobox` 初始化必须放在 datagrid 之后，避免异步报错阻断 datagrid 渲染
- `document.querySelector` + `classList` 操作不支持 IE9 及以下，IE11 可用
- 科室查询接口 `ctloclookupNew` 返回 `{rows:[{ctlocid, ctloc}]}` 格式，需根据项目实际接口调整


## 7. 手动分页

**功能**：HISUI datagrid 手动分页模式，前端控制翻页逻辑，通过 `$.cm()` 调后端获取指定页数据后重置分页器。

### 使用场景
- 后端 Global 遍历 + 内存分页的场景（无法用 SQL LIMIT/OFFSET）
- 需要对匹配结果做复杂处理后分页的场景

### 初始化

```javascript
// datagrid 初始化
$('#dgResult').datagrid({
    fit: true, border: false,
    rownumbers: true, singleSelect: true,
    pagination: true,
    pageSize: 20,
    pageList: [10, 20, 50, 100],
    columns: [[]],
    showFooter: true
});

// 手动分页：绑定 onSelectPage
var p = $('#dgResult').datagrid('getPager');
p.pagination({
    onSelectPage: function(pageNum, pageSize) {
        doQuery(pageNum, pageSize);
    }
});
```

### 查询 + 刷新分页器

```javascript
function doQuery(page, rows) {
    if (arguments.length < 2) { page = 1; rows = 20; }

    $cm({
        ClassName: 'YourClass',
        MethodName: 'QueryData',
        page: page, rows: rows,
        // ... 其他参数
        wantreturnval: 1
    }, function(data) {
        if (!data.ok) { $.messager.alert('提示', data.error, 'error'); return; }

        // 1. 更新 datagrid 数据
        var dg = $('#dgResult');
        dg.datagrid('loadData', data.rows || []);

        // 2. 刷新分页器（先解绑再重新绑定，避免事件循环）
        var p = dg.datagrid('getPager');
        p.pagination({
            onSelectPage: function(pn, ps) { doQuery(pn, ps); }
        });
        p.pagination('refresh', {
            total: data.total,
            pageNumber: page,
            pageSize: rows
        });

        // 3. Footer 汇总（可选）
        if (data.footer && data.rows && data.rows.length > 0) {
            var footerObj = {};
            footerObj[firstField] = '共' + data.total + '条';
            for (var key in data.footer) {
                if (data.footer.hasOwnProperty(key)) {
                    footerObj[key] = parseFloat(data.footer[key]).toFixed(2);
                }
            }
            dg.datagrid('reloadFooter', [footerObj]);
        }
    });
}
```

### 后端分页逻辑

```objectscript
// 1. 全量匹配 -> 收集行 ID 到数组
s totalMatched = 0
s id = 0
for {
    s id = $o(^Global(id))
    q:id=""
    if ..Match(conditions, id) {
        s totalMatched = totalMatched + 1
        s matchedRows(totalMatched) = id
    }
    q:totalMatched '< maxRows   // 上限保护
}

// 2. 按 page/rows 切片
s startIdx = (page - 1) * rows + 1
s endIdx = startIdx + rows - 1
if endIdx > totalMatched s endIdx = totalMatched

// 3. 切片内逐行输出
for idx = startIdx:1:endIdx {
    s rowId = matchedRows(idx)
    s rowData = $g(^Global(rowId))
    // 拼 JSON...
}
```

### 关键注意事项

- `onSelectPage` 内必须手动调 `doQuery(page, rows)`，不能依赖 datagrid 自动请求
- 每次 `loadData` 后必须重新绑定 `onSelectPage`（否则翻页事件丢失）
- `pageSize` 变化时 `page` 应重置为 1
- Footer 行在 `loadData` 后通过 `reloadFooter` 设置


## 8. CSV 导出

**功能**：将查询结果导出为 CSV 文件，UTF-8 BOM 编码，Excel 直接打开无乱码，长数字防科学计数法。

### 使用场景
- 任何查询/报表结果需要导出为 Excel 的场景
- 替代后端生成文件，前端 Blob 下载

### 完整代码

```javascript
function doExport() {
    // 1. 调后端获取全量数据（page=1, rows=上限）
    $cm({
        ClassName: 'YourClass',
        MethodName: 'QueryData',
        page: 1,
        rows: 200000,       // 上限
        wantreturnval: 1
    }, function(data) {
        if (!data.ok) { $.messager.alert('提示', data.error, 'error'); return; }
        var rows = data.rows || [];
        if (rows.length === 0) { $.messager.alert('提示', '无数据可导出', 'info'); return; }

        // 2. 构建 CSV
        var BOM = '﻿';              // UTF-8 BOM（Excel 识别中文）
        var csv = BOM;

        // 表头行
        var header = [];
        for (var i = 0; i < columns.length; i++) {
            header.push(csvEscape(columns[i].title));
        }
        csv += header.join(',') + '\n';

        // 数据行
        for (var r = 0; r < rows.length; r++) {
            var line = [];
            for (var j = 0; j < columns.length; j++) {
                var v = rows[r][columns[j].field] || '-';

                // 长数字加 \t 前缀防科学计数法
                if (columns[j].field.indexOf('JE') > -1 && /^\d/.test(v)) {
                    v = '\t' + v;
                }
                line.push(csvEscape(String(v)));
            }
            csv += line.join(',') + '\n';
        }

        // 3. Blob 下载
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = '导出数据_' + formatDate(new Date()) + '.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}
```

### 辅助函数

```javascript
// CSV 字段转义（含逗号/引号/换行时加双引号包裹）
function csvEscape(str) {
    if (str.indexOf(',') === -1 && str.indexOf('"') === -1 && str.indexOf('\n') === -1) {
        return str;
    }
    return '"' + str.replace(/"/g, '""') + '"';
}

// 日期格式化
function formatDate(d) {
    var y = d.getFullYear();
    var m = ('0' + (d.getMonth() + 1)).slice(-2);
    var day = ('0' + d.getDate()).slice(-2);
    return y + '-' + m + '-' + day;
}
```

### 接入步骤

1. 复制 `csvEscape` + `formatDate` 辅助函数
2. 复制 `doExport` 主体逻辑
3. 替换 `columns` 为实际输出列定义（`[{field, title}]`）
4. 替换后端 `ClassName.MethodName` 和参数
5. 可选：修改 `JE` 匹配规则（费用字段前缀）为项目实际命名规则

### 关键注意事项

- **BOM 是必须的**：`﻿` 确保 Excel 打开 CSV 时正确识别 UTF-8 中文
- **长数字**：费用等长数字前加 `\t` 防止 Excel 自动转科学计数法
- **IE11**：`URL.createObjectURL` + `<a>` click 在 IE11 中可用，注意 `document.body.removeChild(a)` 清理
- **上限保护**：导出时 `rows` 参数传最大值（如 200000），后端应有对应保护逻辑


## 9. 通用弹框规则

**功能**：EasyUI/HISUI `hisui-dialog` 通用 CSS 规则，确保弹窗内容完整显示、无溢出、无滚动条，元素与边框保持合理间距。

### 核心 CSS（复制即用）

```css
/* === 通用弹框规则 === */
/* 1. 弹窗主体：禁止溢出 + 内边距留空 */
.window-body {
    overflow: hidden !important;
    padding: 20px 24px !important;
}
.panel-body.panel-body-dialog {
    overflow: hidden !important;
    padding: 0 !important;
}

/* 2. 表单行间距 */
.dl-row {
    margin-bottom: 14px;
}
.dl-row label {
    display: block;
    margin-bottom: 5px;
    font-size: 13px;
    color: #555;
    font-weight: 500;
}

/* 3. 输入框：border-box 防溢出 */
.dl-row input {
    width: 100%;
    padding: 8px 10px !important;
    height: auto !important;
    box-sizing: border-box;
}

/* 4. 确认弹窗布局 */
.dlg-cfm {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 8px 0;
}
.dlg-cfm-icon {
    color: #e88800;
    font-size: 28px;
    line-height: 1;
    flex-shrink: 0;
}
.dlg-cfm-msg {
    margin: 0;
    font-size: 14px;
    color: #555;
    line-height: 1.8;
}
```

### 关键规则说明

| 规则 | 作用 |
|------|------|
| `.window-body { overflow: hidden }` | 禁止弹窗主体出现滚动条 |
| `.panel-body-dialog { overflow: hidden }` | 禁止 dialog 内层面板溢出 |
| `padding: 20px 24px` | 内容与弹窗边框保持舒适间距 |
| `box-sizing: border-box` | 输入框宽度计算包含 padding 和 border，防止撑出父容器 |
| `flex-shrink: 0` | 确认弹窗图标不被文字挤压变形 |

### 弹窗 HTML 模板

```html
<!-- 新增/编辑弹窗 -->
<div id="dlgBox" class="hisui-dialog">
    <!-- 内容由 JS 动态填充，避免 data-options 内嵌 function -->
</div>

<!-- 确认弹窗 -->
<div id="cfmBox" class="hisui-dialog">
    <!-- 内容由 JS 动态填充 -->
</div>
```

### JS 弹窗初始化模板

```javascript
// 每次打开前 destroy 旧实例，再重新创建（避免内容快照过期）
function showFormDlg(title) {
    try { $('#dlgBox').dialog('destroy'); } catch(e) {}

    var h = '<div class="dlg-inner">';
    h += '<div class="dl-row"><label>编码</label><input id="fCode" class="hisui-validatebox" placeholder="如 ABC"></div>';
    h += '<div class="dl-row"><label>名称</label><input id="fName" class="hisui-validatebox" placeholder="如 名称"></div>';
    h += '</div>';
    $('#dlgBox').html(h);

    $('#dlgBox').dialog({
        title: title,
        closed: false,
        modal: true,
        width: 420,
        top: 140,
        buttons: [
            { text: '确定', iconCls: 'icon-ok', handler: submitForm },
            { text: '取消', handler: function() { $('#dlgBox').dialog('close'); } }
        ]
    });
    setTimeout(function() { try { $('#fCode').focus(); } catch(e2) {} }, 200);
}

function showConfirmDlg(msg, onConfirm) {
    try { $('#cfmBox').dialog('destroy'); } catch(e) {}

    var h = '<div class="dlg-cfm">';
    h += '<span class="dlg-cfm-icon">&#9888;</span>';
    h += '<p class="dlg-cfm-msg">' + msg + '</p>';
    h += '</div>';
    $('#cfmBox').html(h);

    $('#cfmBox').dialog({
        title: '确认操作',
        closed: false,
        modal: true,
        width: 440,
        top: 180,
        buttons: [
            { text: '确认', iconCls: 'icon-ok', handler: function() {
                onConfirm();
                try { $('#cfmBox').dialog('close'); } catch(e) {}
            }},
            { text: '取消', handler: function() { $('#cfmBox').dialog('close'); } }
        ]
    });
}
```

### 接入步骤

1. 复制 CSS 规则到页面 `<style>` 块
2. 复制弹窗 HTML 壳子（`<div id="dlgBox">` / `<div id="cfmBox">`）
3. 复制 JS 模板函数，替换实际表单字段和提交逻辑
4. 确保输入框不设 `style="width:100%"`（交由 CSS 统一控制）

### 注意事项

- **禁止** `data-options` 中内嵌 `function(){}` — EasyUI 解析器会 `eval()` 导致 `Unexpected token` 异常，按钮统一在 `dialog({buttons:[...]})` 中定义
- **禁止** 在 `$(function())` 中预初始化弹窗 — 此时内容为空，后续动态 DOM 不会被识别
- **必须** 每次打开前 `dialog('destroy')` 销毁旧实例，确保内容为最新
- **不要** 在弹窗 body 内重复放置标题（`<h3>`），EasyUI dialog title 栏已提供标题

## 附录：接入检查清单

### 后端

- [ ] 为每个 ClassMethod 添加 `///w ##class(...)` 调试注释
- [ ] `$p` 返回值写入 `$lb` 数值字段前 `+` 强转
- [ ] 持久类添加显式 `Storage`：`DataLocation` + `IdLocation` + Data 段映射
- [ ] `$lb` 位置 1 放入 `%%CLASSNAME`
- [ ] for 循环内 `quit` 无返回值（标志变量模式）
- [ ] `)&&(` 无空格 / `'[` 无空格

### 前端

- [ ] 全部 `var` + `function`，无 ES6+
- [ ] 事件：`e = e || window.event`
- [ ] `className.indexOf("cls") !== -1` 代替 `classList.contains()`
- [ ] `getAttribute("data-xxx")` 代替 `dataset.xxx`
- [ ] HISUI 值：`xxx("getValue")` 非 `.val()`
- [ ] `DEFAULT_FIELDS` 含 `type` 属性
- [ ] `buildColumnsWithType()` 始终查 FIELD_META

### 部署

- [ ] `.cls` UTF-8 无 BOM
- [ ] `.csp` `.js` `.csv` UTF-8 有 BOM
- [ ] 编译后 `SELECT` 验证持久类
- [ ] `kill ^Global(0)` 清理旧计数器
