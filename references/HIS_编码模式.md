# HIS 编码模式

## ObjectScript 常用模式

```objectscript
; 创建持久化对象
Set obj = ##class(ClassName).%New()
Set obj.Property = value
Set sc = obj.%Save()

; SQL 查询
Set stmt = ##class(%SQL.Statement).%New()
Set sc = stmt.%Prepare("SELECT * FROM Table WHERE ...")
Set rs = stmt.%Execute(param)
While rs.%Next() { Write rs.%Get("Column") }

; REST API（继承 %CSP.REST）
ClassMethod SaveData() As %Status
{
    Set data = {}.%FromJSON(%request.Content)
    Write result.%ToJSON()
    Quit $$$OK
}

; 遍历 Global
Set key = "" For {
    Set key = $o(^Global(key))
    Quit:key = ""
}

; 日期/时间转换
s dateH = $zdh(dateStr, 3)    ; 字符串 → $H
s dateStr = $zd(dateH, 3)     ; $H → 字符串
s timeStr = $zt($zth(timeStr, 1), 1)

; 多条件 Filter 模式（在 Global 遍历中过滤）
s sub = "" f {
    s sub = $o(^Index(key, sub))
    q:sub = ""
    q:$d(^||TempFilter($j))&&'$d(^||TempFilter($j,sub))
    ; 处理
}
```

## 临时 Global 命名规范

Query 结果用标准 `^CacheTemp(repid, ind)`（Fetch/Close 模式）。中间计算临时 Global 统一：`^||TempXxx($j, ...)`

- `^||` 进程私有 + `Temp` + 大驼峰描述名（如 `TempTop10`、`TempSort`）
- 第一下标固定 `$j`（JobID），防同一进程重入覆盖
- 用完 `k ^||TempXxx($j)` 清理

## 业务域模块

| 域 | 核心类 | 功能 |
|----|--------|------|
| 预约挂号 | `web.DHCRBAppointment`, `web.DHCRBApptSchedule` | 预约→取号→退约全生命周期 |
| 门诊医嘱 | `web.DHCDocOrderEntry` | 医嘱录入 |
| 诊断录入 | `web.DHCDocDiagnosEntryV8` | ICD 诊断编码 |
| 护理执行 | `web.DHCEMNurExe` | 护理任务执行 |
| 费用统计 | `web.DHCWLfeeSum` | 多维度收入统计 |
| 医保结算 | `DHCINADM`, `DHCINDIV` | 医保登记/结算 |

## EasyUI Datagrid 客户端分页

`loadData(array)` 不分页，需配合 `loadFilter` + `onSelectPage`：

```javascript
// 1. 全量数据存入全局变量
gv.detailRows = rs;

// 2. loadFilter 拦截首次加载，注入 onSelectPage
$('#dg').datagrid({
    pagination: true, pageSize: 30,
    loadFilter: function (data) {
        if (data.total != null) return data;
        var p = $(this).datagrid('getPager');
        p.pagination({
            total: data.length, pageSize: 30,
            onSelectPage: function (pageNumber, pageSize) {
                var start = (pageNumber - 1) * pageSize;
                $('#dg').datagrid('loadData', {
                    total: gv.detailRows.length,
                    rows: gv.detailRows.slice(start, start + pageSize)
                });
            }
        });
        return { total: data.length, rows: data.slice(0, 30) };
    }
}).datagrid('loadData', rs);
```

> `getRows()` 只返回当前页数据，**导出必须用全量变量**，不能用 `getRows()`。

## CSV 导出

```javascript
function doExport() {
    var rows = gv.detailRows;  // 全量数据
    var cols = $('#dg').datagrid('options').columns[0];
    var csv = '﻿' + '标题\n';  // BOM
    var hdrs = [];
    for (var c = 0; c < cols.length; c++) hdrs.push(cols[c].title);
    csv += hdrs.join(',') + '\n';
    for (var r = 0; r < rows.length; r++) {
        var cells = [];
        for (var c2 = 0; c2 < cols.length; c2++) {
            var v = rows[r][cols[c2].field];
            if (v == null) v = '';
            cells.push(String(v).replace(/"/g, '""'));
        }
        csv += cells.join(',') + '\n';
    }
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    if (navigator.msSaveBlob) { navigator.msSaveBlob(blob, '文件名.csv'); return; }
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = '文件名.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
}
```

- CSV 首字符 `﻿`（BOM），否则 Excel 打开中文乱码
- IE11 用 `navigator.msSaveBlob`，现代浏览器用 `<a download>`
| ICU 评分 | `ApacheII.Model.Assessment` | APACHE II 评分 |
