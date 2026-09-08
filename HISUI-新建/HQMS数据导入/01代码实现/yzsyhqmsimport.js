// HQMS 病案首页数据导入 - 界面 JS（IE11 兼容：var + function，无 ES6+）

var IMP_CLS = "web.YZSY.DHCMRInfoHQMSImport";

var curBatchId = "";        // 当前选中批次
var curBatchFileName = "";
var curBatchStatus = "";
var metaMap = {};           // 码 -> {title,type}
var metaReady = false;
var curAuditPage = 1;
var auditPageSize = 20;
var auditTotal = 0;
var gridRecCols = [];       // 审核网格列（元数据就绪后构建）

// ========== 初始化 ==========
$(function () {
    initGrids();
    loadBatches();
});

// 页面内日志明细展开
function showDrawer(id) {
    $("#" + id).show();
    $(".panel.active .grow").css("display", "flex");
}
function closeDrawer(id) {
    $("#" + id).hide();
}

// datagrid 延迟初始化标志（抽屉显示后再建表，避免隐藏态尺寸为 0）
function ensureGrid(sel, optFn, flagKey) {
    var d = $(sel).data(flagKey);
    if (d) { return; }
    optFn();
    $(sel).data(flagKey, true);
}

function initGrids() {
    // 批次网格
    $("#gridBatch").datagrid({
        fit: true, border: false, rownumbers: true, singleSelect: true, pagination: false,
        columns: [[
            { field: "batchId", title: "批次号", width: 70, align: "center" },
            { field: "fileName", title: "文件名", width: 260 },
            { field: "rowCount", title: "记录数", width: 80, align: "center" },
            { field: "colCount", title: "列数", width: 70, align: "center" },
            { field: "passed", title: "已通过", width: 70, align: "center" },
            { field: "audited", title: "已审核", width: 70, align: "center" },
            { field: "status", title: "状态", width: 80, align: "center",
              formatter: function (v) { return v === "已导入" ? '<span style="color:#389e0d">● 已导入</span>' : '<span style="color:#fd7201">● 待导入</span>'; } },
            { field: "createUser", title: "上传人", width: 90, align: "center" },
            { field: "createDate", title: "日期", width: 100, align: "center" },
            { field: "createTime", title: "时间", width: 80, align: "center" },
            { field: "op", title: "操作", width: 210, align: "center",
              formatter: function (v, row) {
                  var h = '<a class="hisui-linkbutton" onclick="goAudit()" data-options="iconCls:\'icon-w-save\'">数据审核</a>';
                  if (row.status === "已导入") {
                      h += '<a class="hisui-linkbutton" onclick="removeImported()" data-options="iconCls:\'icon-w-delete\'" style="margin-left:4px;color:#c00">删除导入数据</a>';
                  } else {
                      h += '<a class="hisui-linkbutton" onclick="removeBatch()" data-options="iconCls:\'icon-w-delete\'" style="margin-left:4px">删除批次</a>';
                  }
                  return h;
              }
            }
        ]]
    });
    // 记录编辑网格的列在 meta 就绪后构建（loadRecords 前调用 ensureGridRecCols）
}

// ========== 面板切换 ==========
function showPanel(name) {
    $(".panel").removeClass("active");
    $("#panel" + name.substr(0, 1).toUpperCase() + name.substr(1)).addClass("active");
}

// ========== 批次与上传 ==========
function loadBatches() {
    $cm({
        ClassName: IMP_CLS,
        MethodName: "ListBatches"
    }, function (data) {
        $("#gridBatch").datagrid("loadData", data || []);
    });
}

// 参照“基数药维护”导入模式：前端本地读取并解析文件（自动识别 GBK/UTF-8），JSON 提交后端
function uploadFile() {
    var files = $("#hqmsFile").filebox("files");
    if (!files || files.length === 0) {
        $.messager.alert("提示", "请先选择 HQMS CSV 文件");
        return;
    }
    var file = files[0];
    var fname = $.trim(file.name || "hqms.csv");   // 去首尾空白后校验
    // 命名要求：须为6位年月，如 202601 / 202601.csv
    var m = /^(\d{6})\.(csv|cvs)$/i.exec(fname) || /^(\d{6})$/i.exec(fname);
    if (!m) {
        $.messager.alert("提示", "文件名不符合要求，须为年月格式，例如：202601.csv（6位年月，如202601）。");
        $("#hqmsFile").filebox("clear");
        return;
    }

    $.messager.progress({ title: "提示", msg: "正在本地读取并解析文件..." });

    // 二进制读取，便于编码识别（UTF-8 BOM / GBK 等）
    var reader = new FileReader();
    reader.onload = function (e) {
        try {
            var bytes = new Uint8Array(e.target.result);
            if (bytes.length > 10 * 1024 * 1024) {
                $.messager.progress("close");
                $.messager.alert("提示", "文件超过10MB，JSON 传输过大，请按年月拆分文件后再导入。");
                return;
            }
            var text = bytesToText(bytes);
            if (text === null) {
                $.messager.progress("close");
                $.messager.alert("错误", "无法识别文件编码，请另存为 UTF-8 或 GBK 后重试");
                return;
            }
            submitParsed(fname, text);
        } catch (err) {
            $.messager.progress("close");
            $.messager.alert("错误", "读取文件失败：" + err.message);
        }
    };
    reader.onerror = function () {
        $.messager.progress("close");
        $.messager.alert("错误", "读取文件失败，请重试");
    };
    try {
        reader.readAsArrayBuffer(file);
    } catch (e2) {
        // IE11 无 ArrayBuffer 支持时退化为 UTF-8 文本读取
        var r2 = new FileReader();
        r2.onload = function (ev) { submitParsed(fname, ev.target.result); };
        r2.onerror = function () { $.messager.progress("close"); $.messager.alert("错误", "读取文件失败"); };
        r2.readAsText(file, "utf-8");
    }
}

// 字节数组 -> 文本（UTF-8(含BOM)/UTF-16/GB18030 自动识别）
function bytesToText(bytes) {
    if (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
        return new TextDecoder("utf-8").decode(bytes.subarray(3));
    }
    if (bytes.length >= 2 && bytes[0] === 0xFF && bytes[1] === 0xFE) {
        return new TextDecoder("utf-16le").decode(bytes.subarray(2));
    }
    if (bytes.length >= 2 && bytes[0] === 0xFE && bytes[1] === 0xFF) {
        return new TextDecoder("utf-16be").decode(bytes.subarray(2));
    }
    if (typeof TextDecoder === "undefined") { return null; }
    try {
        return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch (e) { }
    try {
        return new TextDecoder("gb18030").decode(bytes);
    } catch (e2) { }
    return null;
}

// CSV 文本解析为二维数组（支持双引号包裹与 "" 转义，不支持引号内换行）
function parseCsvRows(text) {
    var rows = [];
    var row = [];
    var cur = "";
    var inQ = false;
    var pushCell = function () { row.push(cur); cur = ""; };
    var pushRow = function () {
        pushCell();
        rows.push(row);
        row = [];
    };
    for (var i = 0; i < text.length; i++) {
        var c = text.charAt(i);
        if (inQ) {
            if (c === '"') {
                if (text.charAt(i + 1) === '"') { cur += '"'; i++; }
                else { inQ = false; }
            } else { cur += c; }
        } else if (c === '"') {
            inQ = true;
        } else if (c === ",") {
            pushCell();
        } else if (c === "\n" || c === "\r") {
            if (c === "\r" && text.charAt(i + 1) === "\n") { i++; }
            if (cur !== "" || row.length > 0) { pushRow(); }
        } else {
            cur += c;
        }
    }
    if (cur !== "" || row.length > 0) { pushRow(); }
    // 过滤整行全空
    var out = [];
    for (var k = 0; k < rows.length; k++) {
        var allEmpty = true;
        for (var j = 0; j < rows[k].length; j++) { if (rows[k][j] !== "") { allEmpty = false; break; } }
        if (!allEmpty) { out.push(rows[k]); }
    }
    return out;
}

// 解析后提交后端（对应 web.YZSY.DHCMRInfoHQMSImport.ImportFileFromJS）
function submitParsed(fname, text) {
    var rows = parseCsvRows(text);
    if (rows.length < 1) {
        $.messager.progress("close");
        $.messager.alert("错误", "未解析到有效数据（首行须为字段码表头）");
        return;
    }
    var headers = rows[0];
    var dataRows = [];
    var badCount = 0;
    for (var i = 1; i < rows.length; i++) {
        if (rows[i].length !== headers.length) { badCount++; continue; }
        dataRows.push(rows[i]);
    }
    if (dataRows.length === 0) {
        $.messager.progress("close");
        $.messager.alert("错误", "无有效数据行（表头列数 " + headers.length + "），请检查文件");
        return;
    }
    var payload = JSON.stringify({ headers: headers, rows: dataRows });
    $.messager.progress({ title: "提示", msg: "正在提交 " + dataRows.length + " 行数据到服务器..." });
    $cm({
        ClassName: IMP_CLS,
        MethodName: "ImportFileFromJS",
        fileName: fname,
        dataJSON: payload
    }, function (rs) {
        $.messager.progress("close");
        if (!rs || !rs.success) {
            $.messager.alert("错误", "导入失败：" + ((rs && rs.msg) || "服务端无返回"));
            return;
        }
        var msg = "解析成功：批次号 " + rs.batchId + "，记录 " + rs.rowCount + " 行，列 " + rs.colCount + " 个（未做字典校验）";
        if (rs.unknownCount > 0) { msg += "<br>含非标准码列 " + rs.unknownCount + " 个（" + rs.unknown + "），需在字段核对中处理"; }
        if (rs.badCount > 0) { msg += "<br>有 " + rs.badCount + " 行列数与表头不一致被跳过"; }
        $.messager.alert("提示", msg);
        $("#hqmsFile").filebox("clear");
        loadBatches();
        // 上传/解析不做校验：字典校验在【数据审核】页通过「字典校验」/「去校验」按需执行
        curBatchId = rs.batchId;
    });
}

function getSelectedBatch() {
    var row = $("#gridBatch").datagrid("getSelected");
    if (!row) { $.messager.alert("提示", "请先在批次列表中选择一个批次"); return null; }
    return row;
}

function goAudit() {
    var row = getSelectedBatch();
    if (!row) return;
    if (row.status === "已导入") {
        $.messager.alert("提示", "该批次已导入。如需修改后重新导入，请先执行【删除导入数据】再重新上传；导入情况见【导入日志】。");
        return;
    }
    curBatchId = row.batchId;
    curBatchFileName = row.fileName;
    curBatchStatus = row.status;
    curAuditPage = 1;
    ensureMeta(function () {
        buildRecCols();
        $("#auditBatchInfo").text("批次 " + curBatchId + "：" + curBatchFileName);
        // 进页直接展示数据（行内"字典校验"列显示校验结果/未校验），
        // 不做自动整批校验：大批次整批校验耗时长，会卡白页面，需要时点工具栏「字典校验」或行内「去校验」
        loadRecords();
    });
    showPanel("audit");
}

function removeBatch() {
    var row = getSelectedBatch();
    if (!row) return;
    $.messager.confirm("确认", "确定删除批次 " + row.batchId + " 的暂存数据吗？（未导入数据将丢失；若导入曾部分成功，其已入库行也会一并删除，防止同文件重导产生重复数据；归档文件一并清理）", function (ok) {
        if (!ok) return;
        $cm({ ClassName: IMP_CLS, MethodName: "RemoveBatch", batchId: row.batchId }, function (rs) {
            if (rs && rs.success) {
                var m = "已删除";
                if (rs.dataDeleted > 0) { m += "（含残留入库行 " + rs.dataDeleted + " 条）"; }
                $.messager.show({ title: "提示", msg: m });
                loadBatches();
            }
            else { $.messager.alert("错误", (rs && rs.msg) || "删除失败"); }
        });
    });
}

// 删除已导入数据（先删后导，解决重复导入）
function removeImported() {
    var row = getSelectedBatch();
    if (!row) return;
    $.messager.confirm("重要确认", "将删除批次 " + row.batchId + " 已导入到 User.YZSYHQMSData 的全部数据及对应导入日志（原文件归档一并清理）。<br><b>该操作不可恢复！</b>删除后该文件可重新上传导入。", function (ok) {
        if (!ok) return;
        $cm({ ClassName: IMP_CLS, MethodName: "RemoveImported", batchId: row.batchId }, function (rs) {
            if (rs && rs.success) {
                $.messager.alert("提示", rs.msg || "已删除");
                loadBatches();
            } else {
                $.messager.alert("错误", (rs && rs.msg) || "删除失败");
            }
        });
    });
}

// ========== 元数据 ==========
function ensureMeta(cb) {
    if (metaReady) { if (cb) cb(); return; }
    $cm({
        ClassName: IMP_CLS,
        MethodName: "GetMetaJSON"
    }, function (arr) {
        metaMap = {};
        for (var i = 0; i < arr.length; i++) {
            metaMap[arr[i].code] = { title: arr[i].title, type: arr[i].type, group: arr[i].group };
        }
        metaReady = true;
        if (cb) cb();
    });
}

// ========== 数据审核与导入 ==========
function buildRecCols() {
    var cols = [];
    cols.push({ field: "rowNo", title: "行号", width: 55, align: "center" });
    cols.push({
        field: "status", title: "状态", width: 70, align: "center",
        formatter: function (v) {
            if (v === 1) return '<span style="color:#389e0d">已通过</span>';
            if (v === 2) return '<span style="color:#fd7201">已驳回</span>';
            if (v === 3) return '<span style="color:#1565c0">已导入</span>';
            return '<span style="color:#888">待审核</span>';
        }
    });
    var semKeys = ["IDCardNo", "RYRQ", "CYRQ", "MainDiag", "MainOper"];
    for (var i = 0; i < semKeys.length; i++) {
        var m = metaMap[semKeys[i]];
        if (m) { cols.push({ field: semKeys[i], title: m.title, width: semKeys[i] === "MainDiag" ? 150 : 100 }); }
    }
    var core = ["A11", "A12C", "A13", "A48", "A49", "A20", "B12", "B15", "B11C", "B13C", "B16C", "B20",
                "C01C", "C02N", "C03C", "C04N", "C05C", "C14x01C", "C15x01N", "C16x01", "C24C", "C25", "C26C", "C27C", "D01"];
    for (var k = 0; k < core.length; k++) {
        var mm = metaMap[core[k]];
        if (mm) { cols.push({ field: core[k], title: core[k] + " " + mm.title, width: 110, align: "center" }); }
    }
    cols.push({ field: "auditUser", title: "审核人", width: 80, align: "center" });
    cols.push({
        field: "vstat", title: "字典校验", width: 150, align: "center",
        formatter: function (v, row) {
            if (v === 2) {
                return '<span style="color:#c00">不通过</span>'
                     + '<a class="hisui-linkbutton" onclick="showValiDetail(' + row.rowNo + ')" data-options="plain:true,iconCls:\'icon-search\'">详情</a>';
            }
            if (v === 1) { return '<span style="color:#389e0d">通过</span>'; }
            return '<span style="color:#aaa">未校验</span>'
                 + '<a class="hisui-linkbutton" onclick="doBatchValidate()" data-options="plain:true,iconCls:\'icon-reload\'">去校验</a>';
        }
    });
    gridRecCols = [cols];
    $("#gridRecs").datagrid({
        fit: true, border: false, rownumbers: false, singleSelect: false, idField: "rowNo",
        pagination: true, pageNumber: curAuditPage, pageSize: auditPageSize, pageList: [10, 20, 50, 100],
        columns: gridRecCols,
        onDblClickRow: function (rowIndex, row) { openEdit(row.rowNo); }
    });
    // 内置分页（样式同“基数药维护/病案自定义查询”）
    var pp = $("#gridRecs").datagrid("getPager");
    if (pp && pp.pagination) {
        pp.pagination({
            pageSize: auditPageSize,
            pageNumber: curAuditPage,
            onSelectPage: function (pn, ps) {
                curAuditPage = pn;
                auditPageSize = ps;
                loadRecords();
            }
        });
    }
}

function getFilter() {
    return $("#selAuditFilter").combobox("getValue");
}

// 校验结果筛选：0=未校验 1=通过 2=不通过（空=全部）
function getValiFilter() {
    var f = "";
    if ($("#selValiFilter").length) { f = $("#selValiFilter").combobox("getValue"); }
    return (f === "0" || f === "1" || f === "2") ? f : "";
}

function loadRecords() {
    if (!curBatchId) return;
    $cm({
        ClassName: IMP_CLS,
        MethodName: "ListRecords",
        batchId: curBatchId,
        page: curAuditPage,
        rows: auditPageSize,
        auditFilter: getFilter(),
        valiFilter: getValiFilter()
    }, function (rs) {
        if (!rs) { return; }
        auditTotal = rs.total || 0;
        $("#gridRecs").datagrid("loadData", rs.rows || []);
        var pages = Math.ceil(auditTotal / auditPageSize);
        if (pages < 1) { pages = 1; }
        if (curAuditPage > pages) { curAuditPage = pages; }
        // 刷新分页条
        var pp = $("#gridRecs").datagrid("getPager");
        if (pp && pp.pagination) {
            pp.pagination("refresh", {
                total: auditTotal,
                pageNumber: curAuditPage,
                pageSize: auditPageSize
            });
        }
    });
}

function getSelectedRowNos() {
    var sels = $("#gridRecs").datagrid("getSelections");
    var list = [];
    for (var i = 0; i < sels.length; i++) { list.push(sels[i].rowNo); }
    return list;
}

function auditRows(pass) {
    var list = getSelectedRowNos();
    if (list.length === 0) { $.messager.alert("提示", "请先勾选记录行"); return; }
    var tip = pass === 1 ? "审核通过" : "驳回";
    $.messager.confirm("确认", "确定将选中的 " + list.length + " 条记录" + tip + "吗？", function (ok) {
        if (!ok) return;
        $cm({
            ClassName: IMP_CLS,
            MethodName: "AuditRows",
            batchId: curBatchId,
            rowsJSON: JSON.stringify(list),
            pass: pass
        }, function (rs) {
            if (rs && rs.success) {
                loadRecords(); loadBatches();
                if (pass === 1 && rs.blocked > 0) {
                    $.messager.alert("提示", "有 <span style='color:#c00'>" + rs.blocked + "</span> 行校验不通过，不能审核通过（请先修改并重新校验）：<br>" + esc(rs.blockedRows || ""), "warning");
                }
            }
            else { $.messager.alert("错误", (rs && rs.msg) || "操作失败"); }
        });
    });
}

function auditAll() {
    $.messager.confirm("确认", "确定将本批次全部未导入记录标记为“审核通过”吗？（已驳回的也会改为通过；校验不通过的行不会被通过）", function (ok) {
        if (!ok) return;
        $cm({
            ClassName: IMP_CLS,
            MethodName: "AuditAll",
            batchId: curBatchId,
            pass: 1
        }, function (rs) {
            if (rs && rs.success) {
                loadRecords(); loadBatches();
                if (rs.blocked > 0) {
                    $.messager.alert("提示", "有 <span style='color:#c00'>" + rs.blocked + "</span> 行校验不通过，不能审核通过（请先修改并重新校验）：<br>" + esc(rs.blockedRows || ""), "warning");
                }
            }
            else { $.messager.alert("错误", (rs && rs.msg) || "操作失败"); }
        });
    });
}

function doImport() {
    if (!curBatchId) { $.messager.alert("提示", "请先选择批次"); return; }
    // 导入前预览：将导入行数与其中校验不通过行数
    $cm({
        ClassName: IMP_CLS,
        MethodName: "GetImportPreview",
        batchId: curBatchId
    }, function (pv) {
        if (!pv || !pv.success) { $.messager.alert("错误", (pv && pv.msg) || "预览失败"); return; }
        if (pv.imported === "1") { $.messager.alert("提示", "该批次已导入，如需重新导入请先【删除导入数据】"); return; }
        if (pv.pass <= 0) { $.messager.alert("提示", "没有审核通过的行可导入"); return; }
        var tip = "将导入审核通过的 " + pv.pass + " 条记录到 User.YZSYHQMSData（纯新增）";
        if (pv.invalid > 0) {
            tip += "<br><span style='color:#c00'>其中 " + pv.invalid + " 条校验不通过，将被拦截并记录日志原因：<br>" + esc(pv.invRows) + "</span>";
        }
        tip += "<br>确定导入？";
        $.messager.confirm("导入确认", tip, function (ok) {
            if (!ok) return;
            $.messager.progress({ title: "提示", msg: "正在导入，请稍候..." });
            $cm({
                ClassName: IMP_CLS,
                MethodName: "ImportBatch",
                batchId: curBatchId
            }, function (rs) {
                $.messager.progress("close");
                if (!rs || !rs.success) { $.messager.alert("错误", (rs && rs.msg) || "导入失败"); return; }
                var msg = "导入完成：成功 " + rs.succ + " 条，失败 " + rs.fail + " 条";
                if (rs.fail > 0 && rs.failMsgs) {
                    msg += "<br><span style='color:#c00'>失败原因：" + esc(rs.failMsgs) + "</span>";
                }
                $.messager.alert("导入结果", msg);
                loadRecords();
                loadBatches();
            });
        });
    });
}

// ========== 记录编辑 ==========
var editOrig = {};   // col -> 原始值

function openEdit(rowNo) {
    $cm({
        ClassName: IMP_CLS,
        MethodName: "GetRecord",
        batchId: curBatchId,
        rowNo: rowNo
    }, function (rs) {
        if (!rs || !rs.success) { $.messager.alert("错误", (rs && rs.msg) || "读取失败"); return; }
        renderEditFields(rs);
        $("#dlgEdit").data("rowNo", rowNo);
        $("#dlgEdit").dialog("open");
        // 校验异常字段标红框 + 悬停提示
        markInvalidFields(rowNo);
    });
}

// 校验异常字段红框 + 悬停（title）提示；属"不在RCxxx"类的字段附"查字典"链接。
// 跨字段规则：提示文本中提及的其它字段码（如 "主要手术日期(C16x01=..)早于入院(B12=..)" 中的 B12）一并标红
function markInvalidFields(rowNo) {
    $("#editFields .dic-link").remove();
    $("#editFields input[data-col]").each(function () {
        $(this).css({ border: "", background: "" }).removeAttr("title");
    });
    $cm({
        ClassName: IMP_CLS,
        MethodName: "GetRecordValidate",
        batchId: curBatchId,
        rowNo: rowNo
    }, function (rs) {
        if (!rs || !rs.success) { return; }
        var fields = rs.fields || [];
        var markCols = {};      // col -> 提示文案
        var markDic = {};       // col -> 字典号
        for (var i = 0; i < fields.length; i++) {
            var f = fields[i];
            var reason = f.reason || "校验不通过";
            if (f.col) {
                if (!markCols[f.col]) { markCols[f.col] = reason; }
                if (f.dic && !markDic[f.col]) { markDic[f.col] = f.dic; }
            }
            // 提取提示中的字段码：(码=…)、(码) 形态，如 C16x01、B12、B15
            var re = /\(([A-Z]{1,4}\d+(?:x\d+)?[A-Z]?[CN]?)\s*(?:\)|=)/g;
            var m;
            while ((m = re.exec(reason)) !== null) {
                var c2 = m[1];
                if (!markCols[c2]) { markCols[c2] = reason; }
            }
        }
        for (var col in markCols) {
            if (!markCols.hasOwnProperty(col)) { continue; }
            var inp = $("#editFields input[data-col='" + col + "']");
            if (inp.length) {
                inp.css({ border: "2px solid #e03838", background: "#fff2f2" }).attr("title", markCols[col]);
                if (markDic[col] && !inp.parent().find(".dic-link").length) {
                    inp.after('<br><a class="hisui-linkbutton dic-link" data-options="plain:true,size:\'small\'" onclick="showDic(\'' + esc(markDic[col]) + '\')">查字典 ' + esc(markDic[col]) + '</a>');
                }
            }
        }
    });
}

// 补加空字段功能已移除（按需求去掉）

// 分组名
var GROUP_NAMES = { A: "A 患者基本信息", B: "B 住院就诊信息", C: "C 诊断手术信息", D: "D 费用信息", F: "F 其他信息", X: "X 语义/控制列" };

function renderEditFields(rs) {
    editOrig = {};
    var fields = rs.fields || [];
    // 按分组归类（无 metaMap 元数据时默认 X）
    var byGrp = {};
    var order = [];
    for (var i = 0; i < fields.length; i++) {
        var f = fields[i];
        editOrig[f.col] = f.value;
        var g = (metaMap[f.col] && metaMap[f.col].group) ? metaMap[f.col].group : "X";
        if (!byGrp[g]) { byGrp[g] = []; order.push(g); }
        byGrp[g].push(f);
    }
    var h = "";
    for (var o = 0; o < order.length; o++) {
        var g = order[o];
        var list = byGrp[g];
        h += '<div class="edit-grp" style="margin:4px 0 2px;color:#15428b;font-weight:700;border-bottom:1px solid #dbe6f5;padding-bottom:2px">'
           + (GROUP_NAMES[g] || g) + '（' + list.length + '）</div>';
        for (var j = 0; j < list.length; j++) {
            var f2 = list[j];
            h += '<div class="edit-item" style="display:inline-block;width:31%;margin:3px 6px 3px 0;vertical-align:top">'
               + '<span style="color:#333" title="' + esc(f2.title) + '">' + esc(f2.title) + '</span>'
               + '<span style="color:#999;font-size:11px;margin-left:3px">(' + esc(f2.col) + ')</span><br>'
               + '<input type="text" data-col="' + esc(f2.col) + '" value="' + esc(f2.value) + '" style="width:100%;height:22px;font-size:12px" />'
               + '</div>';
        }
    }
    if (fields.length === 0) { h = '<div style="color:#888;padding:6px">该行暂无字段可修改。</div>'; }
    $("#editFields").html(h);
}

function filterEditFields(v) {
    v = (v || "").toLowerCase();
    $("#editFields .edit-item").each(function () {
        var txt = $(this).text().toLowerCase();
        $(this).css("display", (v === "" || txt.indexOf(v) >= 0) ? "inline-block" : "none");
    });
    // 过滤时隐藏无匹配项的分组标题
    $("#editFields .edit-grp").each(function () {
        var vis = 0;
        $(this).nextUntil(".edit-grp", ".edit-item").each(function () {
            if ($(this).css("display") !== "none") { vis++; }
        });
        $(this).css("display", (v === "" || vis > 0) ? "block" : "none");
    });
}

function saveRecordEdit() {
    var edits = [];
    $("#editFields input[data-col]").each(function () {
        var col = $(this).attr("data-col");
        edits.push({ col: col, value: $(this).val() });
    });
    var rowNo = $("#dlgEdit").data("rowNo");
    $cm({
        ClassName: IMP_CLS,
        MethodName: "SaveRecord",
        batchId: curBatchId,
        rowNo: rowNo,
        editsJSON: JSON.stringify(edits)
    }, function (rs) {
        if (rs && rs.success) {
            $.messager.show({ title: "提示", msg: "已保存" });
            $("#dlgEdit").dialog("close");
            // 刷新界面数据：审核网格（该行新值/校验状态/审核状态可能变化）
            loadRecords();
            // 批次列表同步刷新（行状态变化会影响批次网格的已通过/已审核计数）
            loadBatches();
        } else {
            $.messager.alert("错误", (rs && rs.msg) || "保存失败");
        }
    });
}

// ========== 字典校验 ==========
function runValidate(cb) {
    if (!curBatchId) { if (cb) cb(null); return; }
    $cm({
        ClassName: IMP_CLS,
        MethodName: "ValidateBatch",
        batchId: curBatchId
    }, function (rs) {
        if (rs && !rs.success) {
            $.messager.alert("错误", rs.msg || "字典校验失败");
        }
        if (cb) cb(rs);
    });
}

// 整批字典校验（带"校验中"进度提示）：进页首次自动校验 / 工具栏「字典校验」 / 「去校验」统一入口
function doBatchValidate(cb) {
    $.messager.progress({ title: "提示", msg: "正在校验批次数据（逐行比对字典值域/格式），请稍候..." });
    runValidate(function (rs) {
        $.messager.progress("close");
        if (cb) { cb(rs); }
    });
}

// 校验详情弹框（hisui-dialog + 纯 HTML 表格）：字段 | 当前值 | 校验信息
function showValiDetail(rowNo) {
    if (!curBatchId) { $.messager.alert("提示", "请先选择批次"); return; }
    if (!$("#dlgVali").length || !$("#valiBody").length) {
        $.messager.alert("错误", "页面缺少校验详情弹窗节点，请确认已部署更新后的 yzsyhqmsimport.csp 并强刷页面(Ctrl+F5)。");
        return;
    }
    $("#valiHead").text("批次 " + curBatchId + " 第 " + rowNo + " 行：正在校验…");
    $("#valiBody").html('<div style="color:#888">请稍候…</div>');
    try { $("#dlgEdit").dialog("close"); } catch (e) { }
    $("#dlgVali").dialog("open");
    $cm({
        ClassName: IMP_CLS,
        MethodName: "GetRecordValidate",
        batchId: curBatchId,
        rowNo: rowNo
    }, function (rs) {
        if (!rs || !rs.success) {
            $("#valiHead").text("批次 " + curBatchId + " 第 " + rowNo + " 行：读取失败");
            $.messager.alert("错误", (rs && rs.msg) || "读取失败（请确认已重新编译 web.YZSY.DHCMRInfoHQMSImport.cls）");
            return;
        }
        var fields = rs.fields || [];
        $("#valiHead").text("批次 " + curBatchId + " 第 " + rowNo + " 行：共发现 " + fields.length + " 处问题");
        var h = '<table style="width:100%;border-collapse:collapse">'
              + '<tr style="background:#eef4ff"><th style="border:1px solid #c9d8f0;padding:5px;text-align:left">字段</th>'
              + '<th style="border:1px solid #c9d8f0;padding:5px;text-align:left">当前值</th>'
              + '<th style="border:1px solid #c9d8f0;padding:5px;text-align:left">校验信息</th></tr>';
        for (var i = 0; i < fields.length; i++) {
            var f = fields[i];
            h += '<tr>'
               + '<td style="border:1px solid #d5deef;padding:5px">' + esc(f.title) + (f.col ? ' (' + esc(f.col) + ')' : '') + '</td>'
               + '<td style="border:1px solid #d5deef;padding:5px">' + (f.value === "" || f.value === null || f.value === undefined ? '<span style="color:#999">（空）</span>' : esc(f.value)) + '</td>'
               + '<td style="border:1px solid #d5deef;padding:5px;color:#c00">' + esc(f.reason)
               + (f.dic ? ' <a class="hisui-linkbutton" data-options="plain:true,size:\'small\'" onclick="showDic(\'' + esc(f.dic) + '\')">查字典 ' + esc(f.dic) + '</a>' : '')
               + '</td></tr>';
        }
        h += '</table>';
        if (fields.length === 0) { h = '<div style="color:#389e0d;padding:6px">该行当前校验通过（0 处问题）。</div>'; }
        $("#valiBody").html(h);
    });
}

// 查看值域内容（查字典）：校验提示"不在RCxxx"时核对合法值
function showDic(dicNo) {
    if (!dicNo) { return; }
    if (!$("#dlgDic").length || !$("#dicBody").length) {
        $.messager.alert("错误", "页面缺少字典内容弹窗节点，请确认已部署更新后的 yzsyhqmsimport.csp 并强刷页面(Ctrl+F5)。");
        return;
    }
    $("#dicHead").text("值域 " + dicNo + "：正在加载…");
    $("#dicBody").html('<div style="color:#888">请稍候…</div>');
    $("#dlgDic").dialog("open");
    $cm({
        ClassName: IMP_CLS,
        MethodName: "GetDicItems",
        dicNo: dicNo
    }, function (rs) {
        if (!rs || !rs.success) {
            $("#dicHead").text("值域 " + dicNo + "：读取失败");
            $.messager.alert("错误", (rs && rs.msg) || "读取失败（请确认已重新编译 web.YZSY.DHCMRInfoHQMSImport.cls）");
            return;
        }
        var items = rs.items || [];
        $("#dicHead").text("值域 " + rs.dic + "：共 " + items.length + " 个合法值");
        var h = '<table style="width:100%;border-collapse:collapse">'
              + '<tr style="background:#eef4ff"><th style="border:1px solid #c9d8f0;padding:5px;text-align:left;width:130px">值</th>'
              + '<th style="border:1px solid #c9d8f0;padding:5px;text-align:left">名称/说明</th></tr>';
        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            h += '<tr>'
               + '<td style="border:1px solid #d5deef;padding:5px">' + esc(it.val) + '</td>'
               + '<td style="border:1px solid #d5deef;padding:5px">' + (it.desc === "" || it.desc === null || it.desc === undefined ? '<span style="color:#999">（无说明）</span>' : esc(it.desc)) + '</td></tr>';
        }
        h += '</table>';
        if (items.length === 0) { h = '<div style="color:#888;padding:6px">该值域暂无字典项数据。</div>'; }
        $("#dicBody").html(h);
    });
}

// ========== 导入日志 ==========
function loadLogs() {
    var sd = $("#logSDate").datebox ? $("#logSDate").datebox("getValue") : "";
    var ed = $("#logEDate").datebox ? $("#logEDate").datebox("getValue") : "";
    if (!$("#gridLogs").data("inited")) {
        $("#gridLogs").datagrid({
            fit: true, border: false, rownumbers: true, singleSelect: true, pagination: false,
            columns: [[
                { field: "logId", title: "日志ID", width: 70, align: "center" },
                { field: "batchNo", title: "批次号", width: 80, align: "center" },
                { field: "fileName", title: "文件名", width: 220 },
                { field: "date", title: "导入日期", width: 100, align: "center" },
                { field: "user", title: "导入人", width: 90, align: "center" },
                { field: "total", title: "通过数", width: 70, align: "center" },
                { field: "succ", title: "成功", width: 60, align: "center" },
                { field: "fail", title: "失败", width: 60, align: "center" },
                { field: "status", title: "状态", width: 90, align: "center",
                  formatter: function (v) {
                      if (v === "导入完成") return '<span style="color:#389e0d">导入完成</span>';
                      if (v === "部分失败") return '<span style="color:#fd7201">部分失败</span>';
                      return v ? '<span style="color:#c00">' + v + '</span>' : "";
                  }
                },
                { field: "errMsg", title: "失败说明", width: 220 },
                { field: "op", title: "明细", width: 80, align: "center",
                  formatter: function (v, row) {
                      return '<a class="hisui-linkbutton" onclick="showLogItems(\'' + row.logId + '\')" data-options="iconCls:\'icon-search\'">明细</a>';
                  }
                }
            ]]
        }).data("inited", true);
    }
    $cm({
        ClassName: IMP_CLS,
        MethodName: "ListLogs",
        SDate: sd || "",
        EDate: ed || ""
    }, function (data) {
        $("#gridLogs").datagrid("loadData", data || []);
    });
}

var logItemPageSize = 20;   // 日志明细每页条数
var curLogId = "";
var curLogPage = 1;

// 打开某条导入日志的明细（分页）
function showLogItems(logId) {
    if (!$("#logItemDrawer").length || !$("#logItemsBody").length || !$("#logItemsPager").length) {
        $.messager.alert("错误", "页面缺少日志明细抽屉节点，请确认已部署更新后的 yzsyhqmsimport.csp 并强刷页面(Ctrl+F5)。");
        return;
    }
    curLogId = logId;
    curLogPage = 1;
    $("#logItemsPager").text("");
    $("#logItemsBody").html('<div style="color:#888">加载中…</div>');
    showDrawer("logItemDrawer");
    loadLogItemsPage();
}

function goLogPage(p) {
    if (!curLogId || p < 1) { return; }
    curLogPage = p;
    loadLogItemsPage();
}

function loadLogItemsPage() {
    if (!curLogId) { return; }
    $("#logItemsBody").html('<div style="color:#888">加载中…</div>');
    $cm({
        ClassName: IMP_CLS,
        MethodName: "ListLogItems",
        logId: curLogId,
        page: curLogPage,
        rows: logItemPageSize
    }, function (rs) {
        if (!rs || !rs.success) {
            $("#logItemsPager").text("");
            $("#logItemsBody").html('<div style="color:#c00;padding:4px">读取明细失败</div>');
            return;
        }
        var list = rs.rows || [];
        var total = rs.total || 0;
        var totalPages = total <= 0 ? 0 : Math.ceil(total / logItemPageSize);
        // 分页条
        var p;
        if (total <= 0) {
            p = "共 0 条";
        } else {
            p = "共 " + total + " 条，第 " + curLogPage + "/" + totalPages + " 页";
            if (curLogPage > 1) {
                p += ' <a href="javascript:void(0)" onclick="goLogPage(' + (curLogPage - 1) + ')" style="color:#15428b;text-decoration:underline;margin:0 4px">上一页</a>';
            }
            if (curLogPage < totalPages) {
                p += ' <a href="javascript:void(0)" onclick="goLogPage(' + (curLogPage + 1) + ')" style="color:#15428b;text-decoration:underline;margin:0 4px">下一页</a>';
            }
        }
        $("#logItemsPager").html(p);
        var h = '<table style="width:100%;border-collapse:collapse">'
              + '<tr style="background:#eef4ff"><th style="border:1px solid #c9d8f0;padding:4px;text-align:left;width:80px">行号</th>'
              + '<th style="border:1px solid #c9d8f0;padding:4px;text-align:left;width:80px">结果</th>'
              + '<th style="border:1px solid #c9d8f0;padding:4px;text-align:left;width:120px">目标RowID</th>'
              + '<th style="border:1px solid #c9d8f0;padding:4px;text-align:left">说明</th></tr>';
        for (var i = 0; i < list.length; i++) {
            var it = list[i];
            h += '<tr>'
               + '<td style="border:1px solid #d5deef;padding:4px;text-align:center">' + esc(it.rowNo) + '</td>'
               + '<td style="border:1px solid #d5deef;padding:4px">' + esc(it.result) + '</td>'
               + '<td style="border:1px solid #d5deef;padding:4px">' + esc(it.target) + '</td>'
               + '<td style="border:1px solid #d5deef;padding:4px">' + esc(it.msg) + '</td></tr>';
        }
        h += '</table>';
        if (list.length === 0) { h = '<div style="color:#888;padding:4px">无明细</div>'; }
        $("#logItemsBody").html(h);
    });
}

// ========== 工具 ==========
function esc(s) {
    if (s === null || s === undefined) return "";
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
