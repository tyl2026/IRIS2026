// HQMS 数据自定义字段查询 - 前端 JS（IE11 兼容）

var Q_CLS = "web.YZSY.DHCMRHQMSQuery";
var metaAll = [];          // {code,title,type,group,groupName}
var metaByGroup = {};      // group -> [meta]
var curGroup = "A";
var selCols = {};          // code -> meta
var curPage = 1;
var qSize = 20;
var resultTotal = 0;
var resultCols = [];       // 最近一次查询的列定义
var GRP_ORDER = ["A", "B", "C", "D", "F", "X"];

// 常用默认勾选列
var DEF_SEL = ["IDCardNo", "RYRQ", "CYRQ", "A48", "A11", "A12C", "A20", "B12", "B15", "C03C", "C04N", "C14x01C", "C15x01N", "D01", "BatchNo", "SrcRowNo"];

$(function () {
    initGrid();
    loadMeta();
});

function loadMeta() {
    $cm({
        ClassName: Q_CLS,
        MethodName: "GetFieldMeta"
    }, function (arr) {
        metaAll = arr || [];
        metaByGroup = {};
        for (var i = 0; i < metaAll.length; i++) {
            var m = metaAll[i];
            if (!metaByGroup[m.group]) { metaByGroup[m.group] = []; }
            metaByGroup[m.group].push(m);
        }
        initGroupTabs();
        for (var j = 0; j < DEF_SEL.length; j++) {
            var d = DEF_SEL[j];
            for (var k = 0; k < metaAll.length; k++) {
                if (metaAll[k].code === d) { selCols[d] = metaAll[k]; break; }
            }
        }
        renderGroup("A");
        renderTags();
        // 元数据就绪后再放条件行（combobox 需要完整字段数据）
        addCond();
    });
}

function initGroupTabs() {
    var h = "";
    for (var i = 0; i < GRP_ORDER.length; i++) {
        var g = GRP_ORDER[i];
        var gname = g;
        for (var k = 0; k < metaAll.length; k++) { if (metaAll[k].group === g) { gname = metaAll[k].groupName; break; } }
        h += '<a class="hisui-linkbutton" data-options="plain:true" onclick="renderGroup(\'' + g + '\')" style="' + (g === "A" ? 'font-weight:bold;color:#1565c0' : '') + '">' + g + '组(' + (metaByGroup[g] ? metaByGroup[g].length : 0) + ')</a>';
    }
    $("#grpTabs").html(h);
    // 简化：分组按钮直接原生样式切换
    $("#grpTabs a").on("click", function () {
        $("#grpTabs a").css({ "font-weight": "", "color": "" });
        $(this).css({ "font-weight": "bold", "color": "#1565c0" });
    });
}

function renderGroup(g) {
    curGroup = g;
    var list = metaByGroup[g] || [];
    var h = "";
    for (var i = 0; i < list.length; i++) {
        var m = list[i];
        var checked = selCols[m.code] ? " checked" : "";
        h += '<label title="' + esc(m.code) + ' ' + esc(m.title) + '"><input type="checkbox" class="fldchk" value="' + m.code + '"' + checked + ' onchange="onFieldCheck(\'' + m.code + '\',this.checked)" /> ' + esc(m.title) + '</label>';
    }
    $("#fieldList").html(h);
}

function onFieldCheck(code, checked) {
    if (checked) {
        for (var i = 0; i < metaAll.length; i++) { if (metaAll[i].code === code) { selCols[code] = metaAll[i]; break; } }
    } else {
        delete selCols[code];
    }
    renderTags();
}

function checkAllField(checked) {
    var list = metaByGroup[curGroup] || [];
    for (var i = 0; i < list.length; i++) {
        var m = list[i].code;
        if (checked) { selCols[m] = list[i]; }
        else { delete selCols[m]; }
    }
    renderGroup(curGroup);
    renderTags();
}

function clearAllSel() {
    selCols = {};
    renderGroup(curGroup);
    renderTags();
}

function renderTags() {
    var h = "";
    var cnt = 0;
    for (var code in selCols) {
        if (!selCols.hasOwnProperty(code)) continue;
        cnt++;
        h += '<span class="tag">' + esc(selCols[code].title) + '(' + code + ') <a href="javascript:void(0)" onclick="removeSel(\'' + code + '\')" style="color:#c00">×</a></span>';
    }
    $("#selTagInner").html(h + (cnt === 0 ? '<span style="color:#999">（未选字段，默认不返回列）</span>' : ""));
}

function removeSel(code) {
    delete selCols[code];
    renderGroup(curGroup);
    renderTags();
}

// ========== 条件 ==========
var condSeq = 0;
// 运算符随字段类型联动（值对应后端 op：eq/neq/ct/sw/gt/ge/lt/le）
var OPS_BY_TYPE = {
    "S":  [["eq", "等于"], ["neq", "不等于"], ["ct", "包含"], ["sw", "开头是"]],
    "N":  [["eq", "等于"], ["neq", "不等于"], ["gt", "大于"], ["ge", "大于等于"], ["lt", "小于"], ["le", "小于等于"]],
    "D":  [["eq", "等于"], ["neq", "不等于"], ["gt", "大于"], ["ge", "大于等于"], ["lt", "小于"], ["le", "小于等于"]],
    "DT": [["eq", "等于"], ["neq", "不等于"], ["gt", "大于"], ["ge", "大于等于"], ["lt", "小于"], ["le", "小于等于"]]
};

function metaTypeOf(code) {
    for (var i = 0; i < metaAll.length; i++) {
        if (metaAll[i].code === code) { return metaAll[i].type || "S"; }
    }
    return "S";
}

// 条件字段下拉数据（按组分）
function condFieldData() {
    var data = [];
    for (var gi = 0; gi < GRP_ORDER.length; gi++) {
        var g = GRP_ORDER[gi];
        var gname = g;
        for (var k = 0; k < metaAll.length; k++) { if (metaAll[k].group === g) { gname = metaAll[k].groupName; break; } }
        var list = metaByGroup[g] || [];
        for (var j = 0; j < list.length; j++) {
            var m = list[j];
            data.push({ value: m.code, text: m.code + " " + m.title, group: gname });
        }
    }
    return data;
}

// 参照 病案数据自定义查询：字段=可搜索+分组 combobox；运算符随字段类型重建
function addCond(pre) {
    pre = pre || {};
    condSeq++;
    var id = "cond" + condSeq;
    var h = '<div class="condRow" id="' + id + '">'
          + '<input class="cField" style="width:230px" />'
          + '<select class="cOp" style="width:110px"><option value="">--</option></select>'
          + '<input type="text" class="cVal" value="' + esc(pre.val || "") + '" placeholder="条件值" style="width:180px;height:24px" />'
          + '<a class="hisui-linkbutton" onclick="$(this).parent().remove()" data-options="iconCls:\'icon-remove\'">删除</a>'
          + '</div>';
    $("#condRows").append(h);
    var input = $("#" + id + " .cField");
    input.combobox({
        valueField: "value",
        textField: "text",
        groupField: "group",
        data: condFieldData(),
        editable: true,
        panelHeight: 240,
        filter: function (q, row) {
            q = (q || "").toLowerCase();
            return ((row.text || "").toLowerCase()).indexOf(q) >= 0;
        },
        onSelect: function () { onCondFieldChange(input); }
    });
    if (pre.col) {
        input.combobox("setValue", pre.col);
        onCondFieldChange(input);
        if (pre.op) { $("#" + id + " .cOp").val(pre.op); }
    }
}

// 字段变化 → 按类型重建运算符选项
function onCondFieldChange(input) {
    var row = $(input).closest(".condRow");
    var code = "";
    try { code = input.combobox("getValue") || ""; } catch (e) { code = input.val() || ""; }
    if (!code) {
        row.find(".cOp").html('<option value="">--</option>');
        return;
    }
    var t = metaTypeOf(code);
    var ops = OPS_BY_TYPE[t] || OPS_BY_TYPE.S;
    var oh = "";
    for (var i = 0; i < ops.length; i++) {
        oh += '<option value="' + ops[i][0] + '">' + ops[i][1] + '</option>';
    }
    row.find(".cOp").html(oh);
}

// ========== 查询 ==========
function getCols() {
    var cols = [];
    for (var code in selCols) {
        if (selCols.hasOwnProperty(code)) { cols.push(code); }
    }
    return cols;
}

function getConds() {
    var conds = [];
    $(".condRow").each(function () {
        var fldEl = $(this).find(".cField");
        var col = "";
        try { col = fldEl.combobox("getValue") || ""; } catch (e) { col = fldEl.val() || ""; }
        var op = $(this).find(".cOp").val();
        var val = $.trim($(this).find(".cVal").val());
        if (col && op && val !== "") { conds.push({ col: col, op: op, val: val }); }
    });
    return conds;
}

function doQuery() {
    var cols = getCols();
    if (cols.length === 0) { $.messager.alert("提示", "请至少勾选一个显示字段"); return; }
    curPage = 1;
    execQuery();
}

function execQuery() {
    var cols = getCols();
    $cm({
        ClassName: Q_CLS,
        MethodName: "QueryData",
        columns: JSON.stringify(cols),
        conditions: JSON.stringify(getConds()),
        page: curPage,
        rows: qSize
    }, function (rs) {
        if (!rs || !rs.success) { $.messager.alert("错误", (rs && rs.msg) || "查询失败"); return; }
        resultTotal = rs.total || 0;
        resultCols = rs.cols || [];
        var colsDef = [];
        for (var i = 0; i < resultCols.length; i++) {
            var c = resultCols[i];
            var w = c.type === "N" ? 100 : 130;
            if (c.code === "%ID") { w = 70; }
            if (c.type === "D" || c.type === "DT") { w = 110; }
            colsDef.push({
                field: c.code,
                title: esc(c.title) + "(" + c.code + ")",
                width: w,
                align: c.type === "N" ? "right" : "center",
                halign: "center",
                formatter: function (v) { return (v === null || v === undefined || v === "") ? "" : esc(String(v)); }
            });
        }
        // rows 为按 cols 顺序的值数组 → 转成 {code:值} 行对象供 datagrid
        var codeList = [];
        for (var ci = 0; ci < resultCols.length; ci++) { codeList.push(resultCols[ci].code); }
        var rowObjs = [];
        var rawRows = rs.rows || [];
        for (var ri = 0; ri < rawRows.length; ri++) {
            var arr = rawRows[ri] || [];
            var o = {};
            for (var cj = 0; cj < codeList.length; cj++) { o[codeList[cj]] = arr[cj]; }
            rowObjs.push(o);
        }
        // 内置分页（同导入页/基数药维护样式），先按列重建网格
        $("#gridResult").datagrid({
            fit: true, border: false, rownumbers: true, singleSelect: true,
            pagination: true, pageNumber: curPage, pageSize: qSize, pageList: [10, 20, 50],
            columns: [colsDef]
        });
        $("#gridResult").datagrid("loadData", rowObjs);
        var pp = $("#gridResult").datagrid("getPager");
        if (pp && pp.pagination) {
            pp.pagination({
                pageNumber: curPage,
                pageSize: qSize,
                onSelectPage: function (pn, ps) { curPage = pn; qSize = ps; execQuery(); }
            });
            pp.pagination("refresh", { total: resultTotal, pageNumber: curPage, pageSize: qSize });
        }
    });
}

function resetQuery() {
    $("#condRows .condRow").remove();
    addCond();
    curPage = 1;
    qSize = 20;
    $("#gridResult").datagrid("loadData", []);
    var pp = $("#gridResult").datagrid("getPager");
    if (pp && pp.pagination) { pp.pagination("refresh", { total: 0, pageNumber: 1, pageSize: qSize }); }
}

// 单次拉取行数上限（与后端 rowCap 保持一致：列越多每批越少，防返回串超长）
function exportChunkRows(colsLen) {
    if (colsLen > 300) { return 80; }
    if (colsLen > 150) { return 150; }
    return 500;
}

// 轻量导出状态角标（右下角非模态小条，避免 messager.progress 遮罩导致页面变黑/卡顿）
function exportStatus(msg) {
    var el = document.getElementById("hqmsExpStat");
    if (!el) {
        el = document.createElement("div");
        el.id = "hqmsExpStat";
        el.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:99999;background:rgba(0,0,0,.78);color:#fff;font-size:12px;padding:8px 14px;border-radius:4px;max-width:70%;line-height:1.6;word-break:break-all";
        document.body.appendChild(el);
    }
    el.style.display = "block";
    el.innerHTML = msg;
}
function exportStatusHide() {
    var el = document.getElementById("hqmsExpStat");
    if (el) { el.style.display = "none"; }
}

// 参照 基数药维护 导出：前端分批拉取全量数据(QueryData 已含字典描述转换) → 本地组装 CSV → Blob 下载
function doExport() {
    var cols = getCols();
    if (cols.length === 0) { $.messager.alert("提示", "请至少勾选一个显示字段"); return; }
    var conds = JSON.stringify(getConds());
    var colsJson = JSON.stringify(cols);
    var chunkRows = exportChunkRows(cols.length);
    var lines = null;          // 首包返回后初始化（含表头）
    var total = 0;
    var got = 0;
    var page = 1;
    var codes = [];
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    var fname = "HQMS查询_" + new Date().getFullYear() + pad(new Date().getMonth() + 1) + pad(new Date().getDate())
              + "_" + pad(new Date().getHours()) + pad(new Date().getMinutes()) + pad(new Date().getSeconds()) + ".csv";

    function fetchNext() {
        exportStatus("正在导出，已取 " + got + "/" + (total || "?") + " 行，请稍候…");
        $cm({
            ClassName: Q_CLS,
            MethodName: "QueryData",
            columns: colsJson,
            conditions: conds,
            page: page,
            rows: chunkRows
        }, function (rs) {
            if (!rs || !rs.success) {
                exportStatusHide();
                $.messager.alert("错误", (rs && rs.msg) || "导出失败");
                return;
            }
            total = rs.total || 0;
            if (lines === null) {
                var colsDef = rs.cols || [];
                for (var i = 0; i < colsDef.length; i++) { codes.push(colsDef[i].code); }
                lines = ["\ufeff"];
                var head = [];
                for (var h = 0; h < colsDef.length; h++) {
                    head.push(csvEsc(colsDef[h].title + "(" + colsDef[h].code + ")"));
                }
                lines.push(head.join(","));
                if (total === 0) {
                    exportStatusHide();
                    $.messager.alert("提示", "没有符合条件的数据可导出");
                    return;
                }
            }
            var rows = rs.rows || [];
            for (var r = 0; r < rows.length; r++) {
                var arr = rows[r] || [];
                var line = [];
                for (var c = 0; c < codes.length; c++) {
                    line.push(csvEsc(arr[c]));
                }
                lines.push(line.join(","));
            }
            got += rows.length;
            if (got < total) {
                page++;
                fetchNext();
            } else {
                exportStatusHide();
                var blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
                if (navigator.msSaveBlob) { navigator.msSaveBlob(blob, fname); return; }
                var a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = fname;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        });
    }
    fetchNext();
}

// CSV 字段转义（含逗号/引号/换行加引号包裹）
function csvEsc(s) {
    if (s === null || s === undefined) { return ""; }
    s = String(s);
    if (s.indexOf(",") >= 0 || s.indexOf("\"") >= 0 || s.indexOf("\n") >= 0 || s.indexOf("\r") >= 0) {
        return "\"" + s.replace(/\"/g, "\"\"") + "\"";
    }
    return s;
}

// ========== 工具 ==========
function esc(s) {
    if (s === null || s === undefined) return "";
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function initGrid() {
    $("#gridResult").datagrid({ fit: true, border: false, rownumbers: true, singleSelect: true, pagination: false, columns: [[{ field: "tip", title: "提示", width: 200 }]] });
    // 条件行延后到元数据就绪后创建（见 loadMeta），避免下拉无数据
}
