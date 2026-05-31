/**
 * DHCWLfeeSum — HIS 收费项目汇总查询
 * 依赖：jQuery, HISUI, DHCCPMRQCommon.js, tools.hui.js
 */

// ============ DOM 工具 ============

function addItemToUl(str, ulobj) {
    var parts = str.split("^");
    var htmlstr = '<span style="margin-right:10px;display:none;">' + parts[0]
        + '</span><span style="margin-right:10px;">' + parts[1]
        + '</span>' + parts[2];
    var li = document.createElement("li");
    li.innerHTML = htmlstr;
    ulobj.appendChild(li);
}

// ============ 数据收集 ============

/** 收集已选项 ID，格式: @ids1^ids2@ids3... */
function getSelectedItems(ulSelector) {
    var parts = [];
    $(ulSelector).each(function () {
        var ids = [];
        var children = this.children;
        for (var j = 0; j < children.length; j++) {
            ids.push(children[j].children[0].innerHTML);
        }
        parts.push(ids.join("^"));
    });
    return parts.length ? "@" + parts.join("@") : "";
}

/** 收集所有查询参数 */
function collectParams() {
    var idstr = getSelectedItems("ul.inputlist");
    var idstr2 = getSelectedItems("ul.inputlist2");
    var sections = idstr.split("@");
    var sections2 = idstr2.split("@");

    return {
        SDate:       $("#SDate").datetimebox('getValue'),
        EDate:       $("#EDate").datetimebox('getValue'),
        HZFlag:      $("input[name='yesno']:checked").val(),
        ExtType:     $('[name="yesno2"]').radio('getValue') ? "1" : "2",
        Arcitems:    sections[1]  || "",
        PatDeps:     sections[2]  || "",
        RecDeps:     sections[3]  || "",
        ItemSubs:    sections[4]  || "",
        ItemTarecs:  sections[5]  || "",
        Taritems:    sections[6]  || "",
        ResDeps:     sections[7]  || "",
        Atype:       sections[8]  || "",
        drugtype:    sections[9]  || "",
        Diag:        sections[10] || "",
        Arcitems2:   sections2[1] || "",
        Taritems2:   sections2[2] || ""
    };
}

/** 将 params 展开为查询字符串 */
function paramsToQuery(p) {
    return "&SDate=" + p.SDate + "&EDate=" + p.EDate
        + "&Arcitems=" + p.Arcitems + "&PatDeps=" + p.PatDeps
        + "&RecDeps=" + p.RecDeps + "&ItemSubs=" + p.ItemSubs
        + "&HZFlag=" + p.HZFlag + "&ItemTarecs=" + p.ItemTarecs
        + "&Taritems=" + p.Taritems + "&ResDeps=" + p.ResDeps
        + "&ExtType=" + p.ExtType + "&Arcitems2=" + p.Arcitems2
        + "&Atype=" + p.Atype + "&drugtype=" + p.drugtype
        + "&Taritems2=" + p.Taritems2 + "&Diag=" + p.Diag;
}

// ============ 表格列显隐 ============

function setColumnVisibility(grid, hzflag) {
    var allCols = [
        "name", "REGNO", "diagstr", "patdepdesc", "ResDoc", "recdepdesc",
        "OESdate", "JFDate", "resdepdesc", "Iadmtype", "xzlx", "ydflag",
        "dayct", "exqty2", "zyts", "arcstr", "oeori", "PAADMAdmDate",
        "zxdays", "age", "admdep"
    ];

    if (hzflag === "1") {
        allCols.forEach(function (col) { grid.datagrid("hideColumn", col); });
    } else {
        var hideCols = (hzflag === "3")
            ? ["diagstr", "Iadmtype", "xzlx", "ydflag", "dayct", "exqty2", "arcstr", "zxdays"]
            : [];
        allCols.forEach(function (col) {
            grid.datagrid(hideCols.indexOf(col) > -1 ? "hideColumn" : "showColumn", col);
        });
    }
}

// ============ Combogrid 工厂 ============

function initCombogrid(selector, queryName, ulSelector, ulIndex, options) {
    options = options || {};
    var valueField = options.valueField || "TCode";
    var transformDesc = options.transformDesc || false;

    $(selector).combogrid({
        panelWidth: 450,
        delay: 500,
        mode: 'remote',
        method: 'GET',
        striped: true,
        fitColumns: true,
        pagination: true,
        editable: true,
        valueField: valueField,
        textField: 'TDesc',
        url: $URL,
        data: [],
        columns: [[
            { field: 'TRowid', title: 'rowid', hidden: true },
            { field: 'TCode',  title: '代码', width: 100 },
            { field: 'TDesc',  title: '名称', width: 160 }
        ]],
        onBeforeLoad: function (param) {
            param.ClassName = "web.DHCWLfeeSum";
            param.QueryName = queryName;
            param.Input = param.q;
        },
        onSelect: function (index, rowData) {
            var desc = rowData.TDesc;
            if (transformDesc && desc.indexOf("-") > -1) {
                desc = desc.split("-")[1];
            }
            addItemToUl(rowData.TRowid + "^" + rowData.TCode + "^" + desc, $(ulSelector)[ulIndex]);
        }
    });
}

// ============ 查询 / 导出 ============

function searchFun() {
    var params = collectParams();
    params.ClassName = 'web.DHCWLfeeSum';
    params.QueryName = 'getfeesum';
    params.rows = 99999;
    $('#mygrid').datagrid('options').url = $URL;
    $('#mygrid').datagrid('load', params);
}

function ExportPrintCommon(resultSetTypeDo) {
    var p = collectParams();
    $.cm({
        localDir: resultSetTypeDo === "Export" ? "Self" : "",
        ResultSetTypeDo: resultSetTypeDo,
        ExcelName: "收费项目明细查询",
        ResultSetType: "ExcelPlugin",
        ClassName: 'web.DHCWLfeeSum',
        QueryName: 'getfeesum',
        SDate: p.SDate, EDate: p.EDate, Arcitems: p.Arcitems, PatDeps: p.PatDeps,
        RecDeps: p.RecDeps, ItemSubs: p.ItemSubs, HZFlag: p.HZFlag,
        ItemTarecs: p.ItemTarecs, Taritems: p.Taritems, ResDeps: p.ResDeps,
        ExtType: p.ExtType, Arcitems2: p.Arcitems2, Atype: p.Atype,
        drugtype: p.drugtype, Taritems2: p.Taritems2, Diag: p.Diag, rows: 99999
    }, false);
}

function ExportPrintCommon2() {
    DHCCPM_RQPrint("收费项目查询报表.rpx" + paramsToQuery(collectParams()));
}

function clickremove() {
    $("ul.inputlist, ul.inputlist2").on("dblclick", "li", function () {
        this.parentNode.removeChild(this);
    });
}

// ============ 主表格 ============

function initdg() {
    $HUI.datagrid("#mygrid", {
        fit: true,
        toolbar: "#custtb",
        columns: [[
            { field: 'PAADMAdmDate', title: "就诊日期", width: 120 },
            { field: 'admtype',       title: "就诊类型", width: 60 },
            { field: 'adm',           title: "就诊号", width: 60 },
            { field: 'admdep',        title: "就诊科室", width: 120 },
            { field: 'age',           title: "年龄", width: 60 },
            { field: 'zyts',          title: "住院天数", width: 60 },
            { field: 'name',          title: "姓名", width: 60 },
            { field: 'XB',            title: "性别", width: 60 },
            { field: 'ZJH',           title: "证件号", width: 120 },
            { field: 'Iadmtype',      title: "医疗类别", width: 80 },
            { field: 'xzlx',          title: "险种类型", width: 60 },
            { field: 'ydflag',        title: "地区", width: 60 },
            { field: 'diagstr',       title: "诊断", width: 120 },
            { field: 'REGNO',         title: "登记号", width: 100 },
            { field: 'medno',         title: "住院号", width: 80 },
            { field: 'patdepdesc',    title: "开单科室", width: 120 },
            { field: 'ResDoc',        title: "开单医生", width: 70 },
            { field: 'recdepdesc',    title: "接收科室", width: 120 },
            { field: 'resdepdesc',    title: "病人科室", width: 120 },
            { field: 'oeori',         title: "医嘱ID", width: 100 },
            { field: 'arccode',       title: "医嘱代码", width: 100 },
            { field: 'arcdesc',       title: "医嘱名称", width: 250 },
            { field: 'OESdate',       title: "医嘱日期", width: 120 },
            { field: 'code',          title: "收费代码", width: 120 },
            { field: 'desc',          title: "收费名称", width: 200 },
            { field: 'JFDate',        title: "计费日期", width: 120 },
            { field: 'qty',           title: "数量", width: 80 },
            { field: 'zxdays',        title: "执行天数", width: 80 },
            { field: 'price',         title: "单价", width: 80 },
            { field: 'totalprice',    title: "总金额", width: 80 },
            { field: 'dayct',         title: "当日计费", width: 80,
                styler: function (value) { if (value > 1) return 'background-color:#ffee00;color:red;'; }
            },
            { field: 'exqty2',        title: "当日计费(同时)", width: 80 },
            { field: 'arcstr',        title: "医嘱串", width: 300 }
        ]],
        pagination: true,
        data: [],
        pageSize: 20,
        singleSelect: true,
        rownumbers: true,
        fitCloumns: true,
        onLoadSuccess: function () {
            setColumnVisibility($('#mygrid'), $("input[name='yesno']:checked").val());
        }
    });
}

// ============ 入口 ============

$(function () {
    initdg();

    var comboCfgs = [
        ["#arcitem",  "getarcitem",  "ul.inputlist",  0],
        ["#arcitem2", "getarcitem",  "ul.inputlist2", 0],
        ["#taritem",  "gettaritem",  "ul.inputlist",  5],
        ["#taritem2", "gettaritem",  "ul.inputlist2", 1],
        ["#patdep",   "getLoc",      "ul.inputlist",  1, { transformDesc: true }],
        ["#recdep",   "getLoc",      "ul.inputlist",  2, { transformDesc: true }],
        ["#resdep",   "getLoc",      "ul.inputlist",  6, { transformDesc: true }],
        ["#arcsub",   "getArcSum",   "ul.inputlist",  3],
        ["#tarecsub", "getTarecsub", "ul.inputlist",  4],
        ["#admtype",  "getadmtype",  "ul.inputlist",  7, { transformDesc: true }],
        ["#drugtype", "getdrugtype", "ul.inputlist",  8, { valueField: "TRowid", transformDesc: true }],
        ["#diag",     "getDiag",     "ul.inputlist",  9, { valueField: "TRowid", transformDesc: true }]
    ];

    comboCfgs.forEach(function (cfg) {
        initCombogrid(cfg[0], cfg[1], cfg[2], cfg[3], cfg[4]);
    });

    clickremove();

    $("#btnSearch").click(searchFun);

    $("#BExport").click(function () {
        var hzflag = $('[name="yesno"]').radio('getValue');
        if (hzflag == 1) {
            ExportPrintCommon("Export");
        } else {
            var oldOk = $.messager.defaults.ok;
            var oldCancel = $.messager.defaults.cancel;
            $.messager.defaults.ok = "excel导出";
            $.messager.defaults.cancel = "报表打印";
            $.messager.confirm("确认", "请选择数据导出方式?", function (r) {
                if (r) { ExportPrintCommon("Export"); }
                else   { ExportPrintCommon2(); }
                $.messager.defaults.ok = oldOk;
                $.messager.defaults.cancel = oldCancel;
            });
        }
    });
});
