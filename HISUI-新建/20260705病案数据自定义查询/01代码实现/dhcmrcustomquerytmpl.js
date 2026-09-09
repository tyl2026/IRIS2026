// 病案编目数据自定义查询 — 模板管理 JS
// IE11 兼容：全部 var + function

var CLASS_NAME = "web.YZSY.DHCMRCustomQuery";
var editingID = "";
var editingColsJSON = "[]";
var editingCondsJSON = "[]";
var FIELD_MAP = {};

$(function() {
    initDatagrid();
    loadData();
    loadFieldMap();
});

function loadFieldMap() {
    $cm({
        ClassName: CLASS_NAME,
        MethodName: "GetFieldMeta",
        wantreturnval: 1
    }, function(data) {
        if (data && data.length) {
            for (var i = 0; i < data.length; i++) {
                FIELD_MAP[data[i].field] = data[i].title;
            }
        }
    });
}

function initDatagrid() {
    $("#dgTemplates").datagrid({
        fit: true,
        border: false,
        rownumbers: true,
        singleSelect: true,
        pagination: false,
        columns: [[
            { field: "ID", title: "ID", width: 50, hidden: true },
            { field: "Name", title: "模板名称", width: 200 },
            { field: "Scope", title: "范围", width: 60, formatter: scopeFormatter },
            { field: "CreateUserName", title: "创建者", width: 80 },
            { field: "CreateDate", title: "创建日期", width: 100 },
            { field: "IsActive", title: "状态", width: 60, formatter: activeFormatter },
            { field: "IsDefault", title: "默认", width: 60, formatter: defaultFormatter },
            { field: "ColumnsJSON", title: "输出列", width: 50, hidden: true },
            { field: "ConditionsJSON", title: "查询条件", width: 50, hidden: true },
            { field: "opt", title: "操作", width: 180, formatter: optFormatter }
        ]],
    });
}

function scopeFormatter(val) {
    if (val === "G") return '<span class="scope-tag public">通用</span>';
    return '<span class="scope-tag private">个人</span>';
}

function activeFormatter(val) {
    return val === "1" ? '<span style="color:#389e0d">启用</span>' : '<span style="color:#999">禁用</span>';
}

function defaultFormatter(val) {
    return val === "1" ? '<span style="color:#017bce;font-weight:700">★ 默认</span>' : "";
}

function optFormatter(val, row) {
    var html = "";
    html += '<a class="hisui-linkbutton" onclick="openEdit(' + row.ID + ')" style="font-size:10px;padding:1px 6px">编辑</a> ';
    if (row.IsDefault === "1") {
        html += '<a class="hisui-linkbutton" onclick="toggleDefault(' + row.ID + ',\'0\')" style="font-size:10px;padding:1px 6px">取消默认</a> ';
    } else {
        html += '<a class="hisui-linkbutton" onclick="toggleDefault(' + row.ID + ',\'1\')" style="font-size:10px;padding:1px 6px">设为默认</a> ';
    }
    html += '<a class="hisui-linkbutton" onclick="deleteTemplate(' + row.ID + ')" style="font-size:10px;padding:1px 6px;color:#f66">删除</a>';
    return html;
}

function detailFormatter(index, row) {
    return "";
}

function detailView(index, row) {
    // 展开时加载模板明细
    var detailHtml = '<div style="padding:8px 12px;background:#f9f9f9;border-bottom:1px solid #ddd">';
    detailHtml += '<div style="font-weight:600;margin-bottom:4px;color:#333">配置明细</div>';

    var cols = [];
    var conds = [];
    try { cols = JSON.parse(row.ColumnsJSON || "[]"); } catch(e) {}
    try { conds = JSON.parse(row.ConditionsJSON || "[]"); } catch(e) {}

    detailHtml += '<div style="font-size:12px;color:#888;margin-bottom:6px"><strong>输出列（' + cols.length + "列）：</strong> ";
    for (var i = 0; i < cols.length; i++) {
        detailHtml += '<span style="background:#eaf2ff;padding:1px 8px;border-radius:10px;margin:2px;display:inline-block">' + escapeHtml(cols[i].title) + "</span>";
    }
    detailHtml += "</div>";

    detailHtml += '<div style="font-size:12px;color:#888"><strong>查询条件（' + conds.length + "条）：</strong>";
    for (var j = 0; j < conds.length; j++) {
        var c = conds[j];
        var opLabel = getOperatorLabel(c.op);
        detailHtml += "<div>" + (j > 0 ? (c.logic || "AND") + " " : "") + "[组" + (parseInt(c.groupId || 0) + 1) + "] " + c.field + " " + opLabel + " " + escapeHtml(c.value || "") + "</div>";
    }
    detailHtml += "</div>";
    detailHtml += "</div>";
    return detailHtml;
}

function loadData() {
    $cm({
        ClassName: CLASS_NAME,
        MethodName: "GetTemplateList",
        UserID: getCurrentUserID(),
        IsActive: $("#filterActive").combobox("getValue") || "",
        wantreturnval: 1
    }, function(data) {
        $("#dgTemplates").datagrid("loadData", data.rows || []);
    });
}

function openEdit(id) {
    editingID = id;
    var row = $("#dgTemplates").datagrid("getRows").filter(function(r) { return r.ID == id; })[0];
    if (!row) return;
    $("#editName").val(row.Name);
    $.parser.parse("#dlgEdit");
    $("#editScope").combobox("setValue", row.Scope);
    $("#editActive").combobox("setValue", row.IsActive);

    // 通过 GetTemplateDetail 获取完整 JSON 配置
    $cm({
        ClassName: CLASS_NAME,
        MethodName: "GetTemplateDetail",
        ID: id,
        wantreturnval: 1
    }, function(data) {
        if (!data || !data.ID) return;
        var cols = [];
        var conds = [];
        try { cols = JSON.parse(data.ColumnsJSON || "[]"); } catch(e) {}
        try { conds = JSON.parse(data.ConditionsJSON || "[]"); } catch(e) {}

        // 缓存原始 JSON，供 saveEdit 使用
        editingColsJSON = data.ColumnsJSON || "[]";
        editingCondsJSON = data.ConditionsJSON || "[]";

        // 显示输出列
        var colHtml = "";
        for (var i = 0; i < cols.length; i++) {
            colHtml += '<span style="background:#eaf2ff;padding:2px 8px;border-radius:10px;display:inline-block;margin:2px">' + escapeHtml(cols[i].title) + "</span>";
        }
        $("#editColPreview").html(colHtml || '<span style="color:#aaa">无</span>');
        $("#editColCount").text(cols.length);

        // 显示查询条件
        var condHtml = "";
        for (var j = 0; j < conds.length; j++) {
            var c = conds[j];
            var fieldTitle = FIELD_MAP[c.field] || c.field || "";
            condHtml += "<div>" + (j > 0 ? (c.logic || "AND") + " " : "") + "[组" + (parseInt(c.groupId || 0) + 1) + "] " + fieldTitle + " " + getOperatorLabel(c.op) + " " + escapeHtml(c.value || "") + "</div>";
        }
        $("#editCondPreview").html(condHtml || '<span style="color:#aaa">无</span>');
        $("#editCondCount").text(conds.length);
    });

    $("#dlgEdit").dialog("open");
}

function saveEdit() {
    var name = $("#editName").val();
    if (!name || name.length < 4) { alert("模板名称至少4个字"); return; }
    var scope = $("#editScope").combobox("getValue");
    var isActive = $("#editActive").combobox("getValue");

    // 用现有数据更新 Name/Scope/IsActive
    var row = $("#dgTemplates").datagrid("getRows").filter(function(r) { return r.ID == editingID; })[0];
    if (!row) return;

    $cm({
        ClassName: CLASS_NAME,
        MethodName: "SaveTemplate",
        ID: editingID,
        Name: name,
        Scope: scope,
        UserID: getCurrentUserID(),
        ColumnsJSON: editingColsJSON,
        ConditionsJSON: editingCondsJSON,
        wantreturnval: 1
    }, function(data) {
        if (data.ok) {
            // 更新启用状态
            if (isActive !== row.IsActive) {
                $cm({
                    ClassName: CLASS_NAME,
                    MethodName: "ToggleActive",
                    ID: editingID,
                    IsActive: isActive,
                    wantreturnval: 1
                });
            }
            $("#dlgEdit").dialog("close");
            loadData();
        } else {
            alert(data.error || "保存失败");
        }
    });
}

function toggleDefault(id, isDefault) {
    $cm({
        ClassName: CLASS_NAME,
        MethodName: "ToggleDefault",
        ID: id,
        IsDefault: isDefault,
        wantreturnval: 1
    }, function() { loadData(); });
}

function deleteTemplate(id) {
    var row = $("#dgTemplates").datagrid("getRows").filter(function(r) { return r.ID == id; })[0];
    var tip = "确定删除模板「" + (row ? row.Name : id) + "」？";
    $.messager.confirm("确认删除", tip, function(ok) {
        if (!ok) return;
        $cm({
            ClassName: CLASS_NAME,
            MethodName: "DeleteTemplate",
            ID: id,
            UserID: getCurrentUserID(),
            CTLocDesc: (typeof session !== 'undefined' && session['LOGON.CTLOCDESC']) || "",
            wantreturnval: 1
        }, function(data) {
            if (data.ok) {
                loadData();
            } else {
                $.messager.alert("提示", data.error || "删除失败", "error");
            }
        });
    });
}

function getCurrentUserID() {
    try { return (typeof session !== 'undefined' && session['LOGON.USERID']) || $USERID || sessionStorage.getItem("UserID") || "unknown"; } catch(e) { return "unknown"; }
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function getOperatorLabel(op) {
    var map = {eq:"等于",neq:"不等于",gt:"大于",gte:"大于等于",lt:"小于",lte:"小于等于",between:"区间",contains:"包含",startswith:"左匹配"};
    return map[op] || op;
}
