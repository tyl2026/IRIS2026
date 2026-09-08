// 病案编目数据自定义查询 — 查询主界面 JS
// IE11 兼容：全部 var + function，无 ES6+

var CLASS_NAME = "web.YZSY.DHCMRCustomQuery";
var FIELD_META = [];    // 字段元数据（从后端加载）
var FIELD_GROUPS = [];  // 分组信息
var selectedFields = []; // 已选字段 [{field,title,piece,group}]
var currentTemplateID = "";
var currentTemplateScope = "";
var conditionGroupSeq = 1; // 条件组序号

// 默认输出列预设（11 常用列）
var DEFAULT_FIELDS = [
    {field:"MR_XM", title:"姓名", piece:8, type:"String", group:"基本信息"},
    {field:"MR_BAH", title:"病案号", piece:4, type:"String", group:"住院信息"},
    {field:"MR_NN", title:"年龄", piece:11, type:"String", group:"基本信息"},
    {field:"MR_XB", title:"性别", piece:9, type:"Gender", group:"基本信息"},
    {field:"MR_RYRQ", title:"入院日期", piece:35, type:"Date", group:"住院信息"},
    {field:"MR_RYKB", title:"入院科别", piece:36, type:"CTLoc", group:"住院信息"},
    {field:"MR_CYRQ", title:"出院日期", piece:39, type:"Date", group:"住院信息"},
    {field:"MR_CYKB", title:"出院科别", piece:40, type:"CTLoc", group:"住院信息"},
    {field:"MR_SJZYTS", title:"住院天数", piece:42, type:"Number", group:"住院信息"},
    {field:"MR_CYZYZDMC", title:"出院诊断", piece:53, type:"String", group:"诊断信息"},
    {field:"MR_ZFJE", title:"总费用", piece:232, type:"Number", group:"费用信息"}
];

// ========== 初始化 ==========
$(function() {
    initLayout();
    loadFieldMeta();
    initSelectedFields();
    renderColumnChips();
    refreshDgColumns();
    loadTemplateList();
    checkDefaultTemplate();
});

function initLayout() {
    var dg = $("#dgResult");
    dg.datagrid({
        fit: true, border: false, rownumbers: true, singleSelect: true,
        pagination: true, pageSize: 20, pageList: [10, 20, 50, 100],
        columns: [[]], showFooter: true
    });
    var p = dg.datagrid("getPager");
    p.pagination({
        onSelectPage: function(pn, ps) { doQuery(pn, ps); }
    });
}

// 加载字段元数据
function loadFieldMeta() {
    $cm({
        ClassName: CLASS_NAME,
        MethodName: "GetFieldMeta",
        wantreturnval: 1
    }, function(data) {
        FIELD_META = data || [];
        buildGroupMap();
    });
}

function buildGroupMap() {
    var groupNames = [];
    var i;
    for (i = 0; i < FIELD_META.length; i++) {
        var g = FIELD_META[i].group;
        if (groupNames.indexOf(g) === -1) {
            groupNames.push(g);
        }
    }
    FIELD_GROUPS = groupNames;
}

// 初始化已选字段（预设常用列，如有默认模板则用模板覆盖）
function initSelectedFields() {
    selectedFields = DEFAULT_FIELDS.slice();
}

// ========== 模板面板 ==========

function toggleTemplatePanel() {
    var hdr = $("#tplPanelHeader");
    var list = $("#tplList");
    if (hdr.hasClass("expanded")) {
        hdr.removeClass("expanded");
        list.slideUp(200);
    } else {
        hdr.addClass("expanded");
        list.slideDown(200);
    }
}

function loadTemplateList() {
    $cm({
        ClassName: CLASS_NAME,
        MethodName: "GetTemplateList",
        UserID: getCurrentUserID(),
        IsActive: "1",
        wantreturnval: 1
    }, function(data) {
        renderTemplateList(data.rows || []);
    });
}

function renderTemplateList(rows) {
    var container = $("#tplList");
    var count = rows.length;
    $("#tplCount").text(count).toggle(count > 0);
    if (count === 0) {
        container.html('<div style="padding:8px 20px;color:#888;font-size:12px">暂无模板</div>');
        return;
    }
    var html = "";
    for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        // 跳过当前已加载的模板
        if (currentTemplateID && r.ID == currentTemplateID) continue;
        var scopeLabel = r.Scope === "G" ? "通用" : "个人";
        var scopeClass = r.Scope === "G" ? "" : " personal";
        html += '<div class="tpl-item">';
        html += '<span class="tpl-name">' + escapeHtml(r.Name) + "</span>";
        html += '<span class="scope-tag' + scopeClass + '">' + scopeLabel + "</span>";
        html += '<span style="color:#888;font-size:11px">' + escapeHtml(r.CreateDate) + "</span>";
        html += '<div style="flex:1"></div>';
        html += '<a class="hisui-linkbutton" onclick="loadTemplate(' + r.ID + ')" style="font-size:10px;padding:1px 6px">引用</a>';
        html += '<a class="hisui-linkbutton" onclick="showTplDetail(' + r.ID + ')" style="font-size:10px;padding:1px 6px">明细</a>';
        html += "</div>";
    }
    container.html(html);
}

function loadTemplate(id) {
    $cm({
        ClassName: CLASS_NAME,
        MethodName: "GetTemplateDetail",
        ID: id,
        wantreturnval: 1
    }, function(data) {
        if (data.ID) {
            currentTemplateID = data.ID;
            currentTemplateScope = data.Scope;
            // 解析并填充 columns
            try {
                selectedFields = JSON.parse(data.ColumnsJSON);
            } catch(e) {
                selectedFields = [];
            }
            renderColumnChips();
            refreshDgColumns();
            // 解析并填充 conditions
            try {
                var conds = JSON.parse(data.ConditionsJSON);
                restoreConditions(conds);
            } catch(e) {}
            // 更新当前模板指示器
            showCurrentTemplate(data.Name, data.Scope, selectedFields.length, conds ? conds.length : 0);
            // 刷新模板列表
            loadTemplateList();
        }
    });
}

function showCurrentTemplate(name, scope, colN, condN) {
    var bar = $("#tplCurrentBar");
    $("#currentTplName").text(name);
    $("#currentTplInfo").text(colN + "列 " + condN + "条件");
    var scopeLabel = scope === "G" ? "通用" : "个人";
    var scopeClass = scope === "G" ? "" : " personal";
    $("#currentTplScope").text(scopeLabel).attr("class", "scope-tag" + scopeClass);
    bar.show();
}

function changeTemplate() {
    var panel = $("#tplPanelHeader");
    if (!panel.hasClass("expanded")) {
        toggleTemplatePanel();
    }
}

function viewTemplateDetail() {
    if (currentTemplateID) {
        showTplDetail(currentTemplateID);
    }
}

function showTplDetail(id) {
    $cm({
        ClassName: CLASS_NAME,
        MethodName: "GetTemplateDetail",
        ID: id,
        wantreturnval: 1
    }, function(data) {
        if (!data.ID) return;
        var cols = [];
        var conds = [];
        try { cols = JSON.parse(data.ColumnsJSON); } catch(e) {}
        try { conds = JSON.parse(data.ConditionsJSON); } catch(e) {}
        var html = '<div style="font-weight:700;margin-bottom:8px">' + escapeHtml(data.Name) + "</div>";
        html += '<div style="margin-bottom:4px;color:#888">范围：' + (data.Scope === "G" ? "通用" : "个人") + "</div>";
        html += '<div style="font-weight:600;margin:8px 0 4px">输出列（' + cols.length + "列）：</div>";
        html += '<div style="display:flex;gap:4px;flex-wrap:wrap">';
        for (var i = 0; i < cols.length; i++) {
            html += '<span style="background:#eaf2ff;padding:2px 8px;border-radius:4px;font-size:12px">' + escapeHtml(cols[i].title) + "</span>";
        }
        html += "</div>";
        html += '<div style="font-weight:600;margin:8px 0 4px">查询条件（' + conds.length + "条）：</div>";
        for (var j = 0; j < conds.length; j++) {
            var c = conds[j];
            var opLabel = getOperatorLabel(c.op);
            html += '<div style="font-size:12px;padding:2px 0">' + (j > 0 ? (c.logic || "AND") + " " : "") + (c.groupId ? "[组" + (parseInt(c.groupId) + 1) + "] " : "") + getFieldTitle(c.field) + " " + opLabel + " " + escapeHtml(c.value || "") + "</div>";
        }
        html += "</div>";
        $("#dlgTplDetailContent").html(html);
        $("#dlgTplDetail").dialog("open");
    });
}

// ========== 输出列 ==========

function renderColumnChips() {
    var container = $("#colChips");
    if (selectedFields.length === 0) {
        container.html('<span style="font-size:12px;color:#aaa">未选择输出列</span>');
    } else {
        var html = "";
        for (var i = 0; i < selectedFields.length; i++) {
            html += '<span style="background:#eaf2ff;padding:2px 10px;border-radius:12px;font-size:12px;display:inline-block;margin:2px">' + escapeHtml(selectedFields[i].title) + "</span>";
        }
        container.html(html);
    }
    $("#colCount").text("已选 " + selectedFields.length + " 列");
}

function openColumnSelector() {
    buildFieldTree();
    buildSelectedList();
    $("#dlgColumn").dialog("open");
}

var currentGroup = ""; // 当前选中的分组

function buildFieldTree() {
    var tabsHtml = "";
    for (var g = 0; g < FIELD_GROUPS.length; g++) {
        tabsHtml += '<a class="hisui-linkbutton" data-group="' + FIELD_GROUPS[g] + '" onclick="switchFieldGroup(this)" style="font-size:11px;margin:2px">' + FIELD_GROUPS[g] + "</a>";
    }
    $("#groupTabs").html(tabsHtml);
    // 初始化 HISUI 按钮
    $.parser.parse("#groupTabs");
    currentGroup = FIELD_GROUPS[0];
    renderFieldTreeByGroup(currentGroup);
}

function switchFieldGroup(el) {
    currentGroup = el.getAttribute("data-group");
    renderFieldTreeByGroup(currentGroup);
}

function renderFieldTreeByGroup(group) {
    var q = ($("#fieldSearch").val() || "").toLowerCase();
    var html = "";
    for (var g = 0; g < FIELD_GROUPS.length; g++) {
        var gname = FIELD_GROUPS[g];
        // 如果有搜索词：显示所有匹配字段（跨组）
        // 如果无搜索词：只显示当前选中组
        if (!q && gname !== group) continue;
        html += '<div style="font-weight:600;padding:4px 6px;border-bottom:1px solid #eee;background:#f5f5f5">' + gname + "</div>";
        var hasFields = false;
        for (var i = 0; i < FIELD_META.length; i++) {
            var f = FIELD_META[i];
            if (f.group !== gname) continue;
            if (q && f.title.toLowerCase().indexOf(q) === -1 && f.field.toLowerCase().indexOf(q) === -1) continue;
            hasFields = true;
            var checked = isFieldSelected(f.field) ? " checked" : "";
            html += '<div style="padding:2px 6px 2px 16px"><label style="font-size:12px"><input type="checkbox" value="' + f.field + '"' + checked + ' onclick="onFieldCheck(this)"> ' + escapeHtml(f.title) + '</label></div>';
        }
        // 如果该组无匹配字段，去掉组标题
        if (!hasFields) {
            html = html.substring(0, html.lastIndexOf('<div style="font-weight:600'));
        }
    }
    $("#fieldTree").html(html);
}

function filterFieldTree() {
    // 搜索时显示所有组
    var q = $("#fieldSearch").val();
    if (q) {
        // 有搜索词时遍历所有组
        renderFieldTreeByGroup("");
    } else {
        renderFieldTreeByGroup(currentGroup || FIELD_GROUPS[0]);
    }
}

function isFieldSelected(field) {
    for (var i = 0; i < selectedFields.length; i++) {
        if (selectedFields[i].field === field) return true;
    }
    return false;
}

function onFieldCheck(cb) {
    var field = cb.value;
    if (cb.checked) {
        if (isFieldSelected(field)) return;
        // 在 FIELD_META 中查找
        for (var i = 0; i < FIELD_META.length; i++) {
            if (FIELD_META[i].field === field) {
                selectedFields.push(FIELD_META[i]);
                break;
            }
        }
    } else {
        selectedFields = selectedFields.filter(function(f) { return f.field !== field; });
    }
    buildSelectedList();
}

function buildSelectedList() {
    var html = "";
    for (var i = 0; i < selectedFields.length; i++) {
        html += '<div class="sel-item" draggable="true" data-field="' + selectedFields[i].field + '"';
        html += ' style="padding:3px 6px;margin:2px;background:#eaf2ff;border-radius:4px;font-size:12px;display:flex;align-items:center;cursor:grab"';
        html += ' ondragstart="onSelDragStart(event)" ondragend="onSelDragEnd(event)"';
        html += ' ondragover="onSelDragOver(event)" ondragleave="onSelDragLeave(event)"';
        html += ' ondrop="onSelDrop(event)">';
        html += '<span style="flex:1;pointer-events:none">' + escapeHtml(selectedFields[i].title) + "</span>";
        html += '<a style="color:#f66;cursor:pointer;margin-left:4px" onclick="removeSelectedField(\'' + selectedFields[i].field + '\')">×</a>';
        html += "</div>";
    }
    $("#selectedList").html(html || '<span style="color:#aaa;font-size:11px">暂无已选字段</span>');
    $("#selectedCount").text("已选 " + selectedFields.length + " 列");
}

// ========== 已选列拖拽排序 ==========

var selDragField = "";
function onSelDragStart(e) {
    e = e || window.event;
    selDragField = e.target.getAttribute("data-field") || "";
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text", selDragField);
    e.target.style.opacity = "0.4";
}

function onSelDragEnd(e) {
    e = e || window.event;
    e.target.style.opacity = "1";
    selDragField = "";
    var items = document.getElementById("selectedList").getElementsByTagName("div");
    for (var k = 0; k < items.length; k++) {
        items[k].style.borderTop = "";
    }
}

function onSelDragOver(e) {
    e = e || window.event;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    var target = e.target;
    if (target.className.indexOf("sel-item") === -1) return;
    if (target.getAttribute("data-field") === selDragField) return;
    target.style.borderTop = "2px solid #017bce";
}

function onSelDragLeave(e) {
    e = e || window.event;
    var target = e.target;
    if (target.className.indexOf("sel-item") === -1) return;
    target.style.borderTop = "";
}

function onSelDrop(e) {
    e = e || window.event;
    e.preventDefault();
    var target = e.target;
    target.style.borderTop = "";
    if (target.className.indexOf("sel-item") === -1) return;
    var toField = target.getAttribute("data-field") || "";
    var fromField = e.dataTransfer.getData("text") || selDragField;
    if (!fromField || !toField || fromField === toField) return;
    var fromIdx = -1, toIdx = -1;
    for (var m = 0; m < selectedFields.length; m++) {
        if (selectedFields[m].field === fromField) fromIdx = m;
        if (selectedFields[m].field === toField) toIdx = m;
    }
    if (fromIdx === -1 || toIdx === -1) return;
    var item = selectedFields.splice(fromIdx, 1)[0];
    selectedFields.splice(toIdx, 0, item);
    selDragField = "";
    buildSelectedList();
}

// ========== 已选列移除 ==========

function removeSelectedField(field) {
    selectedFields = selectedFields.filter(function(f) { return f.field !== field; });
    buildSelectedList();
    // 同步 checkbox
    $("#fieldTree input[value='" + field + "']").prop("checked", false);
}

function selectAllFields() {
    var cbs = $("#fieldTree input[type='checkbox']");
    cbs.prop("checked", true);
    for (var i = 0; i < FIELD_META.length; i++) {
        if (!isFieldSelected(FIELD_META[i].field)) {
            selectedFields.push(FIELD_META[i]);
        }
    }
    buildSelectedList();
}

function invertSelection() {
    var cbs = $("#fieldTree input[type='checkbox']");
    for (var j = 0; j < cbs.length; j++) {
        var cb = cbs[j];
        cb.checked = !cb.checked;
        onFieldCheck(cb);
    }
    buildSelectedList();
}

function confirmColumnSelection() {
    renderColumnChips();
    $("#dlgColumn").dialog("close");
    // 立即更新datagrid表头
    refreshDgColumns();
}

function refreshDgColumns() {
    if (selectedFields.length === 0) return;
    var dgCols = [];
    for (var i = 0; i < selectedFields.length; i++) {
        var f = selectedFields[i];
        dgCols.push({
            field: f.field,
            title: f.title,
            width: Math.max(80, Math.floor(800 / selectedFields.length)),
            align: (f.field.indexOf("JE") > -1 || f.field.indexOf("FY") > -1) ? "right" : "left"
        });
    }
    var dg = $("#dgResult");
    try { dg.datagrid("destroy"); } catch(e) {}
    dg.datagrid({
        fit: true, border: false, rownumbers: true, singleSelect: true,
        pagination: true, pageSize: 20, pageList: [10, 20, 50, 100],
        columns: [dgCols], showFooter: true
    });
    var p = dg.datagrid("getPager");
    p.pagination({
        onSelectPage: function(pn, ps) { doQuery(pn, ps); }
    });
}

// ========== 查询条件 ==========

function addCondition(groupId) {
    if (arguments.length === 0) {
        // 默认加到最后一个条件组
        var groups = $("#condContainer .cond-group");
        if (groups.length === 0) {
            addConditionGroup();
            return;
        }
        var lastId = groups.last().attr("id").replace("condGroup", "");
        groupId = lastId;
    }
    var list = $("#condList" + groupId);
    if (list.length === 0) {
        addConditionGroup();
        return;
    }
    var idx = list.children().length;
    var html = '<div class="cond-row" data-group="' + groupId + '" data-idx="' + idx + '">';
    // 逻辑（第一条不显示）
    if (idx > 0) {
        html += '<select class="cond-logic" style="width:60px"><option>AND</option><option>OR</option></select>';
    }
    // 字段选择（combobox，分组+可搜索）
    html += '<input class="cond-field hisui-combobox" style="width:180px">';
    // 运算符（动态）
    html += '<select class="cond-op" style="width:90px"><option value="">--</option></select>';
    // 值
    html += '<span class="cond-value"></span>';
    // 删除
    html += '<a style="color:#f66;cursor:pointer;font-size:14px" onclick="removeCondition(this)">×</a>';
    html += "</div>";
    list.append(html);
    // 初始化字段combobox（分组数据）
    var fieldInput = list.find(".cond-field").last();
    initFieldCombo(fieldInput);
}

function addConditionGroup() {
    var gid = conditionGroupSeq.toString();
    conditionGroupSeq++;
    var html = '<div id="condGroup' + gid + '" class="cond-group">';
    html += '<div class="group-label">条件组 ' + conditionGroupSeq + ' <a style="color:#f66;cursor:pointer;font-size:11px" onclick="removeConditionGroup(\'' + gid + '\')">删除组</a></div>';
    html += '<div id="condList' + gid + '"></div>';
    html += "</div>";
    $("#condContainer").append(html);
    // 自动添加第一条条件
    addCondition(gid);
}

function removeConditionGroup(gid) {
    var groups = $("#condContainer .cond-group");
    if (groups.length <= 1) {
        alert("至少保留一个条件组");
        return;
    }
    $("#condGroup" + gid).remove();
}

function removeCondition(el) {
    $(el).closest(".cond-row").remove();
}

// 初始化字段combobox（分组+搜索）
function initFieldCombo(input) {
    var data = [];
    for (var g = 0; g < FIELD_GROUPS.length; g++) {
        var gname = FIELD_GROUPS[g];
        for (var i = 0; i < FIELD_META.length; i++) {
            var f = FIELD_META[i];
            if (f.group !== gname) continue;
            data.push({
                value: f.field + "|" + f.type,
                text: f.title,
                group: gname
            });
        }
    }
    // 如果是 select 元素，先转为 input（避免 option/data 冲突）
    if (input.is("select")) {
        var selVal = input.val();
        var parent = input.parent();
        var newInput = $('<input class="cond-field hisui-combobox" style="width:180px">');
        input.remove();
        parent.append(newInput);
        input = newInput;
    }
    input.combobox({
        valueField: "value",
        textField: "text",
        groupField: "group",
        data: data,
        editable: true,
        filter: function(q, row) {
            var t = (row.text || "").toLowerCase();
            var v = (row.value || "").toLowerCase();
            q = q.toLowerCase();
            return t.indexOf(q) >= 0 || v.indexOf(q) >= 0;
        },
        onSelect: function(rec) {
            onCondFieldChange(input, rec);
        }
    });
}

function onCondFieldChange(el, rec) {
    var row = $(el).closest(".cond-row");
    var val = rec ? rec.value : $(el).combobox("getValue");
    if (!val) {
        row.find(".cond-op").html('<option value="">--</option>');
        row.find(".cond-value").html("");
        return;
    }
    var parts = val.split("|");
    var fieldType = parts[1];
    // 根据字段类型生成运算符列表
    var ops = [];
    if (fieldType === "Date" || fieldType === "Number") {
        ops = [
            {v:"eq", l:"等于"},
            {v:"neq", l:"不等于"},
            {v:"gt", l:"大于"},
            {v:"gte", l:"大于等于"},
            {v:"lt", l:"小于"},
            {v:"lte", l:"小于等于"},
            {v:"between", l:"区间"}
        ];
    } else {
        ops = [
            {v:"contains", l:"包含"},
            {v:"notcontains", l:"不包含"},
            {v:"startswith", l:"左匹配"}
        ];
    }
    var opHtml = "";
    for (var i = 0; i < ops.length; i++) {
        opHtml += '<option value="' + ops[i].v + '">' + ops[i].l + "</option>";
    }
    row.find(".cond-op").html(opHtml);
    // 触发运算符变更
    row.find(".cond-op").off("change").on("change", function() {
        onCondOpChange(row);
    });
    onCondOpChange(row);
}

function onCondOpChange(row) {
    var op = row.find(".cond-op").val();
    var fieldInput = row.find(".cond-field");
    var fieldVal = fieldInput.is(".hisui-combobox") ? (fieldInput.combobox("getValue") || "") : fieldInput.val();
    var fieldType = "String";
    if (fieldVal && fieldVal.indexOf("|") > -1) {
        fieldType = fieldVal.split("|")[1];
    }
    var valSpan = row.find(".cond-value");
    var isDate = (fieldType === "Date");
    var cls = isDate ? " hisui-datebox" : "";
    if (op === "between") {
        valSpan.html('<input class="cond-val1' + cls + '" style="width:100px"> ~ <input class="cond-val2' + cls + '" style="width:100px">');
    } else {
        valSpan.html('<input class="cond-val1' + cls + '" style="width:180px">');
    }
    if (isDate) {
        row.find(".cond-val1").datebox({editable:false});
        if (op === "between") row.find(".cond-val2").datebox({editable:false});
    }
}

// 收集当前查询条件
function collectConditions() {
    var conds = [];
    var groups = $("#condContainer .cond-group");
    groups.each(function(gi) {
        var rows = $(this).find(".cond-row");
        rows.each(function(ri) {
            var fieldInput = $(this).find(".cond-field");
            var fieldSel = fieldInput.is(".hisui-combobox") ? (fieldInput.combobox("getValue") || "") : fieldInput.val();
            if (!fieldSel) return;
            var field = fieldSel.split("|")[0];
            var op = $(this).find(".cond-op").val();
            if (!op) return;
            var logicSel = $(this).find(".cond-logic");
            var logic = logicSel.length ? (logicSel.val() || "AND") : "AND";
            var $v1 = $(this).find(".cond-val1");
            var $v2 = $(this).find(".cond-val2");
            var isDate = $v1.hasClass("hisui-datebox");
            var val1 = (isDate && $v1.length) ? ($v1.datebox("getValue") || "") : ($v1.val() || "");
            var val2 = "";
            if (op === "between" && $v2.length) {
                val2 = (isDate) ? ($v2.datebox("getValue") || "") : ($v2.val() || "");
            }
            var value = op === "between" ? val1 + "~" + val2 : val1;
            if (!value) return;
            var piece = 0;
            var ftype = "String";
            for (var k = 0; k < FIELD_META.length; k++) {
                if (FIELD_META[k].field === field) { piece = FIELD_META[k].piece; ftype = FIELD_META[k].type; break; }
            }
            conds.push({
                field: field,
                piece: piece,
                type: ftype,
                op: op,
                value: value,
                logic: logic,
                groupId: gi.toString()
            });
        });
    });
    return conds;
}

function restoreConditions(conds) {
    $("#condContainer").empty();
    conditionGroupSeq = 0;
    // 重建条件组
    var groups = {};
    for (var i = 0; i < conds.length; i++) {
        var gid = conds[i].groupId || "0";
        if (!groups[gid]) groups[gid] = [];
        groups[gid].push(conds[i]);
    }
    for (var gid in groups) {
        if (!groups.hasOwnProperty(gid)) continue;
        addConditionGroup();
        var curGid = (conditionGroupSeq - 1).toString()
        // 移除 addConditionGroup 自动添加的空条件
        $("#condList" + curGid).empty();
        var list = groups[gid];
        for (var j = 0; j < list.length; j++) {
            var c = list[j];
            addCondition(curGid);
            var lastRow = $("#condList" + curGid + " .cond-row").last();
            // 设置逻辑
            if (j > 0 && c.logic) {
                lastRow.find(".cond-logic").val(c.logic);
            }
            // 设置字段值
            var fv = c.field + "|" + (c.type || "String");
            setTimeout(function(row, fieldVal) {
                row.find(".cond-field").combobox("setValue", fieldVal);
                onCondFieldChange(row.find(".cond-field")[0], {value: fieldVal});
            }, 150, lastRow, fv);
            // 设置运算符和值
            var opVal = c.op;
            var v1 = (c.value || "").split("~")[0] || "";
            var v2 = (c.value || "").split("~")[1] || "";
            setTimeout(function(row, ov, val1, val2) {
                row.find(".cond-op").val(ov).trigger("change");
                setTimeout(function() {
                    var isDate = row.find(".cond-val1").hasClass("hisui-datebox");
                    if (ov === "between") {
                        if (isDate) {
                            row.find(".cond-val1").datebox("setValue", val1);
                            row.find(".cond-val2").datebox("setValue", val2);
                        } else {
                            row.find(".cond-val1").val(val1);
                            row.find(".cond-val2").val(val2);
                        }
                    } else {
                        if (isDate) row.find(".cond-val1").datebox("setValue", val1);
                        else row.find(".cond-val1").val(val1);
                    }
                }, 250);
            }, 350, lastRow, opVal, v1, v2);
        }
    }
    if (conditionGroupSeq === 0) {
        addConditionGroup();
    }
}

// ========== 查询与导出 ==========

function doQuery(page, rows) {
    if (arguments.length < 2) { page = 1; rows = 20; }
    if (selectedFields.length === 0) {
        alert("请至少选择一个输出列");
        return;
    }
    var columns = JSON.stringify(buildColumnsWithType());
    var conds = collectConditions();
    var conditions = JSON.stringify(conds);

    $cm({
        ClassName: CLASS_NAME,
        MethodName: "QueryData",
        columns: columns,
        conditions: conditions,
        page: page,
        rows: rows,
        wantreturnval: 1
    }, function(data) {
        if (!data.ok) {
            alert(data.error || "查询失败");
            return;
        }
        // 构建列定义
        var dgCols = [];
        for (var i = 0; i < selectedFields.length; i++) {
            var f = selectedFields[i];
            dgCols.push({
                field: f.field,
                title: f.title,
                width: Math.max(80, Math.floor(800 / selectedFields.length)),
                align: (f.field.indexOf("JE") > -1 || f.field.indexOf("FY") > -1) ? "right" : "left"
            });
        }
        var dg = $("#dgResult");
        dg.datagrid({ columns: [dgCols] });
        dg.datagrid("loadData", data.rows || []);
        // 刷新分页器（先解绑避免循环）
        var p = dg.datagrid("getPager");
        p.pagination({ onSelectPage: function(pn2, ps2) { doQuery(pn2, ps2); } });
        p.pagination("refresh", { total: data.total, pageNumber: page, pageSize: rows });

        // footer
        if (data.footer && data.rows && data.rows.length > 0) {
            var footerObj = {};
            footerObj[selectedFields[0].field] = "共" + data.total + "条";
            for (var key in data.footer) {
                if (data.footer.hasOwnProperty(key)) {
                    footerObj[key] = parseFloat(data.footer[key]).toFixed(2);
                }
            }
            dg.datagrid("reloadFooter", [footerObj]);
        }
    });
}

function doExport() {
    if (selectedFields.length === 0) { alert("请先选择输出列"); return; }
    var columns = JSON.stringify(buildColumnsWithType());
    var conds = collectConditions();
    var conditions = JSON.stringify(conds);

    // 请求全量数据（后端有 200k 上限）
    $cm({
        ClassName: CLASS_NAME,
        MethodName: "QueryData",
        columns: columns,
        conditions: conditions,
        page: 1,
        rows: 200000,
        wantreturnval: 1
    }, function(data) {
        if (!data.ok) { alert(data.error); return; }
        var rows = data.rows || [];
        if (rows.length === 0) { alert("无数据可导出"); return; }
        // 构建 CSV
        var BOM = "﻿";
        var csv = BOM;
        // 表头
        var header = [];
        for (var i = 0; i < selectedFields.length; i++) {
            header.push(csvEscape(selectedFields[i].title));
        }
        csv += header.join(",") + "\n";
        // 数据行
        for (var r = 0; r < rows.length; r++) {
            var line = [];
            for (var j = 0; j < selectedFields.length; j++) {
                var v = rows[r][selectedFields[j].field] || "-";
                // 长数字加 \t 前缀防科学计数法
                if (selectedFields[j].field.indexOf("JE") > -1 && /^\d/.test(v)) {
                    v = "\t" + v;
                }
                line.push(csvEscape(String(v)));
            }
            csv += line.join(",") + "\n";
        }
        // Blob 下载
        var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "编目数据查询_" + formatDate(new Date()) + ".csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}

// ========== 保存模板 ==========

function saveTemplate() {
    if (selectedFields.length === 0) { alert("请先选择输出列"); return; }
    var conds = collectConditions();
    // 填充预览
    var colsHtml = "";
    for (var i = 0; i < selectedFields.length; i++) {
        colsHtml += '<span style="background:#eaf2ff;padding:2px 8px;border-radius:10px;margin:2px;display:inline-block">' + escapeHtml(selectedFields[i].title) + "</span>";
    }
    $("#saveColPreview").html(colsHtml);
    $("#saveColCount").text(selectedFields.length);
    var condPreviewHtml = buildConditionsPreviewHTML(conds);
    $("#saveCondPreview").html(condPreviewHtml);
    $("#saveCondCount").text(conds.length);
    // 预填：当前模板名 + scope，新增时留空
    if (currentTemplateID) {
        $("#saveTplName").val($("#currentTplName").text());
        $("#saveTplScope").val(currentTemplateScope || "P");
    } else {
        $("#saveTplName").val("");
        $("#saveTplScope").val("P");
    }
    window._pendingSaveData = { conds: conds, isNew: !currentTemplateID };
    $("#dlgSaveTpl").dialog("open");
}

function newTemplate() {
    currentTemplateID = "";
    currentTemplateScope = "";
    $("#tplCurrentBar").hide();
    saveTemplate();
}

function doSaveTemplate() {
    var name = $("#saveTplName").val();
    if (!name || name.length < 4) { alert("模板名称至少需要4个字"); return; }
    var scope = $("#saveTplScope").val();
    var conds = window._pendingSaveData ? window._pendingSaveData.conds : collectConditions();
    var columnsJSON = JSON.stringify(selectedFields);
    var conditionsJSON = JSON.stringify(conds);
    // 新增时 ID=0，修改时用当前ID
    var useID = window._pendingSaveData && window._pendingSaveData.isNew ? "0" : (currentTemplateID || "0");

    $cm({
        ClassName: CLASS_NAME,
        MethodName: "SaveTemplate",
        ID: useID,
        Name: name,
        Scope: scope,
        UserID: getCurrentUserID(),
        ColumnsJSON: columnsJSON,
        ConditionsJSON: conditionsJSON,
        wantreturnval: 1
    }, function(data) {
        if (data && data.ok) {
            $.messager.alert("提示", "模板保存成功", "info");
            currentTemplateID = data.id;
            currentTemplateScope = scope;
            showCurrentTemplate(name, scope, selectedFields.length, (conds || []).length);
            loadTemplateList();
            try { $("#dlgSaveTpl").dialog("close"); } catch(e) {}
        } else {
            $.messager.alert("错误", (data && data.error) || "保存失败", "error");
        }
    });
}

function buildColumnsWithType() {
    var cols = [];
    for (var i = 0; i < selectedFields.length; i++) {
        var f = selectedFields[i];
        var ftype = f.type;
        // 从 FIELD_META 补全/修正 type（覆盖旧模板或 DEFAULT_FIELDS 中可能不准确的类型）
        for (var k = 0; k < FIELD_META.length; k++) {
            if (FIELD_META[k].field === f.field) { ftype = FIELD_META[k].type; break; }
        }
        cols.push({field: f.field, title: f.title, piece: f.piece, type: ftype || "String"});
    }
    return cols;
}

function buildColumnsPreview() {
    var s = "输出列（" + selectedFields.length + "列）：";
    for (var i = 0; i < selectedFields.length; i++) {
        s += selectedFields[i].title;
        if (i < selectedFields.length - 1) s += "、";
    }
    return s;
}

function buildConditionsPreviewHTML(conds) {
    var s = "";
    for (var i = 0; i < conds.length; i++) {
        var c = conds[i];
        s += "<div>" + (i > 0 ? (c.logic || "AND") + " " : "") + "[组" + (parseInt(c.groupId || 0) + 1) + "] " + getFieldTitle(c.field) + " " + getOperatorLabel(c.op);
        if (c.op === "between") {
            var parts = (c.value || "~~").split("~");
            s += " " + (parts[0] || "") + " ~ " + (parts[1] || "");
        } else {
            s += " " + (c.value || "");
        }
        s += "</div>";
    }
    return s;
}

// ========== 工具函数 ==========

function getCurrentUserID() {
    try {
        return (typeof session !== 'undefined' && session['LOGON.USERID']) || $USERID || sessionStorage.getItem("UserID") || "unknown";
    } catch(e) {
        return "unknown";
    }
}

function getFieldTitle(field) {
    for (var i = 0; i < FIELD_META.length; i++) {
        if (FIELD_META[i].field === field) return FIELD_META[i].title;
    }
    return field;
}

function getOperatorLabel(op) {
    var map = {eq:"等于", neq:"不等于", gt:"大于", gte:"大于等于", lt:"小于", lte:"小于等于", between:"区间", contains:"包含", notcontains:"不包含", startswith:"左匹配"};
    return map[op] || op;
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function csvEscape(str) {
    if (str.indexOf(",") === -1 && str.indexOf('"') === -1 && str.indexOf("\n") === -1) return str;
    return '"' + str.replace(/"/g, '""') + '"';
}

function formatDate(d) {
    var y = d.getFullYear();
    var m = ("0" + (d.getMonth() + 1)).slice(-2);
    var day = ("0" + d.getDate()).slice(-2);
    return y + "-" + m + "-" + day;
}

function openTemplateMgmt() {
    window.open("dhcmrcustomquerytmpl.csp", "_blank");
}

function checkDefaultTemplate() {
    $cm({
        ClassName: CLASS_NAME,
        MethodName: "GetDefaultTemplate",
        UserID: getCurrentUserID(),
        wantreturnval: 1
    }, function(data) {
        if (data.ID) {
            currentTemplateID = data.ID;
            currentTemplateScope = data.Scope;
            try { selectedFields = JSON.parse(data.ColumnsJSON); } catch(e) {}
            renderColumnChips();
            refreshDgColumns();
            try { var conds = JSON.parse(data.ConditionsJSON); restoreConditions(conds); } catch(e) {}
            showCurrentTemplate(data.Name, data.Scope, selectedFields.length, 0);
        }
    });
}
