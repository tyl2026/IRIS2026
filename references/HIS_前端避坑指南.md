# HIS 前端避坑指南

## IE11 兼容性约束

HIS 客户端为 IE11 内核，**禁止 ES6+ API**：

| 禁用 | 替代 |
|------|------|
| `let`/`const` | `var` |
| `() => {}` 箭头函数 | `function() {}` |
| `Promise`/`async`/`await` | 回调函数 |
| `padStart`/`startsWith`/`includes` | `indexOf`/手动补位 |
| `for...of` | `for (var i=0;...)` |
| `Array.from()` | `Array.prototype.slice.call()` |
| `new Set()` / `new Map()` | 用对象 `{}` 替代 |

## HISUI JS 陷阱

以下常见 HISUI 前端写法会报错或返回无效数据：

| 禁用 | 原因 | 替代 |
|------|------|------|
| `$(sel).textbox('setValue',v)` | `hisui-validatebox` 未初始化时无 `.textbox()` 方法 | `$(sel).val(v)` |
| 客户端 `$cm({...})` | 客户端 `$cm` 可能未定义 | `$.ajax({url: $URL + '?ClassName=...&QueryName=...', ...})` |
| 客户端 `$lb()` / `websys.Page.Encrypt()` | 客户端 `$lb` 不可用 | CSP `OnPreHTTP` 加 Method 代理 |
| `.combobox({data:[], onSelect:fn})` 缺 `filter` | 下拉输入框无法检索 | 必须加 `filter: function(q,row){...}` |
| `<table data-options="columns:[[{formatter: function(){...}}]]">` | CSP 编译器 `#5928` 报错 | 空 `<table>` + JS 中 `.datagrid({columns:...})` |
| `.combobox('loadData', rows)` 单独调用 | 仅刷新数据不补缺失选项 | `.combobox({data:rows, filter:..., onSelect:...})` 完整重建 |

## 服务端检索 combobox 模板

```javascript
function loadSearchCombo(selector, queryName, onSelectFn) {
    $(selector).combobox({
        valueField: 'RowID', textField: 'Desc', data: [],
        onSelect: onSelectFn
    });
    var tb = $(selector).combobox('textbox');
    tb.off('keyup.search').on('keyup.search', function(e) {
        if (e.keyCode >= 37 && e.keyCode <= 40) return;
        if (e.keyCode === 13) return;
        var q = $(this).val();
        clearTimeout(tb.data('searchTimer'));
        tb.data('searchTimer', setTimeout(function() {
            $.ajax({
                url: $URL + '?ClassName=web.XXX&QueryName=FindXXX&searchKey=' + encodeURIComponent(q),
                type: 'GET', dataType: 'json',
                success: function(data) {
                    $(selector).combobox('loadData', data.rows || []);
                }
            });
        }, 250));
    });
}
```

## CSP Method 代理模板

```html
<csp:method name="OnPreHTTP" arguments="" returntype="%Boolean">
    s %response.CharSet = "utf-8"
    if ($d(%request.Data("MethodName", 1))) {
        s cls = %request.Get("ClassName")
        s mtd = %request.Get("MethodName")
        w $classmethod(cls, mtd, %request.Get("paramName"))
        q 0
    }
    q 1
</csp:method>
```

JS 侧：`$.ajax({url: $URL + '?ClassName=...&MethodName=Save&paramName=...', type:'GET', ...})`

## 第三方 JS 库路径

| 库 | 路径 | 用途 |
|----|------|------|
| SheetJS | `../scripts_lib/SheetJs/xlsx.full.min.js` | Excel 读写 |

新增库在 `irislib/scripts_lib/<库名>/` 存放。
