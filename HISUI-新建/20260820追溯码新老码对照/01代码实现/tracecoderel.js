/**
 * 追溯码新老码对照维护 — HISUI 前端逻辑
 * 数据来源: ^YZSY("DHCTraceCdoeRel",收费项代码)
 * 后端: web.YZSY.DHCTraceCodeRel
 * IE11 compatible
 */
var gPageSize = 20;

/* ============================== AJAX ============================== */
function api(method, params, cb) {
    var data = { ClassName: 'web.YZSY.DHCTraceCodeRel', MethodName: method };
    for (var key in params) {
        if (params.hasOwnProperty(key)) { data[key] = params[key]; }
    }
    $m(data, function(txt) {
        var result = {};
        if (typeof txt === 'string') {
            try { result = JSON.parse(txt); } catch(e) { result = {}; }
        } else if (txt && typeof txt === 'object') {
            result = txt;
        }
        if (cb) { cb(result); }
    });
}

/* ============================== Toast ============================== */
function toast(msg, err) {
    var el = $('<div></div>').text(msg).css({
        position: 'fixed', top: '18px', left: '50%', transform: 'translateX(-50%)',
        background: err ? '#d44' : '#15428b', color: '#fff',
        padding: '10px 28px', borderRadius: '4px', fontSize: '14px',
        zIndex: 99999, boxShadow: '0 2px 12px rgba(0,0,0,0.18)'
    }).appendTo('body');
    el.fadeIn(200).delay(1600).fadeOut(400, function() { el.remove(); });
}

/* ============================== Utils ============================== */
function inputVal(id) {
    var $el = $('#' + id);
    var v = '';
    try { v = $el.datebox('getValue'); } catch(e1) {}
    if (typeof v !== 'string' || v === '') { v = $el.val(); }
    return $.trim(v);
}
function escHtml(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escQuote(s) { return String(s == null ? '' : s).replace(/\\/g,'\\\\').replace(/'/g,"\\'"); }
function findRowByCode(code) {
    var rows = $('#dg').datagrid('getRows');
    for (var i = 0; i < rows.length; i++) {
        if (rows[i].Code === code) { return rows[i]; }
    }
    return null;
}

/* ============================== Grid Load ============================== */
function getParams() {
    return {
        Code: inputVal('qCode'),
        ActiveFlag: inputVal('qFlag')
    };
}

function loadGrid(page, rows) {
    var params = getParams();
    params.Page = page || 1;
    params.Rows = rows || gPageSize;
    api('QueryCodeRel', params, function(rs) {
        var total = (rs && rs.total) ? rs.total : 0;
        var list  = (rs && rs.rows)  ? rs.rows  : [];
        try {
            $('#dg').datagrid('loadData', { total: total, rows: list });
            var pager = $('#dg').datagrid('getPager');
            $(pager).pagination({
                total: total, pageNumber: (params.Page > 0 ? params.Page : 1),
                pageSize: (params.Rows > 0 ? params.Rows : gPageSize),
                pageList: [20, 50, 100]
            });
        } catch(e) {}
    });
}

function doQuery() { loadGrid(1, gPageSize); }

function doReset() {
    $('#qCode').val('');
    $('#qFlag').val('');
    loadGrid(1, gPageSize);
}

/* ============================== Add / Edit Dialog ============================== */
function openAddDlg() {
    openDlg('add', null);
}

function openEditDlg(code) {
    var row = findRowByCode(code);
    if (!row) { toast('未找到该记录', true); return; }
    openDlg('edit', row);
}

function openDlg(mode, row) {
    // 每次重建弹窗容器（避免在 display:none 的源元素上初始化 dialog 导致正文高度为0、只显示按钮）
    var old = document.getElementById('dlgEdit');
    if (old && old.parentNode) { old.parentNode.removeChild(old); }
    $('<div id="dlgEdit"><div class="dlg-inner">' +
      '<div class="dl-row"><label><span style="color:red">*</span>收费项代码</label><input id="fCode" class="hisui-textbox"></div>' +
      '<div class="dl-row"><label><span style="color:red">*</span>老码</label><input id="fOldCode" class="hisui-textbox"></div>' +
      '<div class="dl-row"><label><span style="color:red">*</span>新码</label><input id="fNewCode" class="hisui-textbox"></div>' +
      '<div class="dl-row"><label>开始日期</label><input id="fStartDate" class="hisui-datebox"></div>' +
      '<div class="dl-row"><label>结束日期</label><input id="fEndDate" class="hisui-datebox"></div>' +
      '<div class="dl-row"><label>可用标志</label><select id="fFlag"><option value="Y">可用</option><option value="N">不可用</option></select></div>' +
      '</div></div>').appendTo('body');

    var fmtDate = function(d) {
        return d.getFullYear() + '-' + ((d.getMonth()+1)<10?'0':'') + (d.getMonth()+1) + '-' + (d.getDate()<10?'0':'') + d.getDate();
    };
    try { $('#fStartDate').datebox({ formatter: fmtDate }); } catch(e1) {}
    try { $('#fEndDate').datebox({ formatter: fmtDate }); } catch(e2) {}

    var title = '新增追溯码对照';
    if (mode === 'add') {
        $('#fCode').val('').removeAttr('readonly');
        $('#fOldCode').val('');
        $('#fNewCode').val('');
        $('#fStartDate').val('');
        $('#fEndDate').val('');
        $('#fFlag').val('Y');
    } else {
        title = '修改追溯码对照';
        $('#fCode').val(row.Code).attr('readonly', 'readonly');
        $('#fOldCode').val(row.OldCode);
        $('#fNewCode').val(row.NewCode);
        $('#fStartDate').val(row.StartDate);
        $('#fEndDate').val(row.EndDate);
        $('#fFlag').val(row.ActiveFlag);
        try { $('#fStartDate').datebox('setValue', row.StartDate); } catch(e3) {}
        try { $('#fEndDate').datebox('setValue', row.EndDate); } catch(e4) {}
    }

    // 容器可见状态下再初始化并打开 dialog
    $('#dlgEdit').dialog({
        title: title, closed: false, modal: true, width: 460, top: 80,
        buttons: [
            { text: '保存', handler: function() { saveDlg(); } },
            { text: '关闭', handler: function() { $('#dlgEdit').dialog('close'); } }
        ]
    });
}

function saveDlg() {
    var code = $.trim($('#fCode').val());
    var oldCode = $.trim($('#fOldCode').val());
    var newCode = $.trim($('#fNewCode').val());
    var startDate = inputVal('fStartDate');
    var endDate = inputVal('fEndDate');
    var flag = $('#fFlag').val();
    if (!code) { toast('收费项代码不能为空', true); return; }
    if (!oldCode) { toast('老码不能为空', true); return; }
    if (!newCode) { toast('新码不能为空', true); return; }
    api('Save', {
        Code: code, OldCode: oldCode, NewCode: newCode,
        StartDate: startDate, EndDate: endDate, ActiveFlag: flag
    }, function(rs) {
        if (rs && rs.success) {
            toast(rs.msg || '保存成功');
            $('#dlgEdit').dialog('close');
            loadGrid(1, gPageSize);
        } else {
            toast((rs && rs.msg) || '保存失败', true);
        }
    });
}

/* ============================== Toggle Flag ============================== */
function toggleFlag(code) {
    var row = findRowByCode(code);
    if (!row) { toast('未找到该记录', true); return; }
    var newFlag = (row.ActiveFlag === 'Y') ? 'N' : 'Y';
    var tip = (newFlag === 'Y') ? '确定要启用该对照吗?' : '确定要停用该对照吗?';
    if (!window.confirm(tip)) { return; }
    api('SetActiveFlag', { Code: code, ActiveFlag: newFlag }, function(rs) {
        if (rs && rs.success) { toast('操作成功'); loadGrid(1, gPageSize); }
        else { toast((rs && rs.msg) || '操作失败', true); }
    });
}

/* ============================== Batch Flag ============================== */
function getSelectedCodes() {
    var rows = $('#dg').datagrid('getSelections');
    var codes = [];
    for (var i = 0; i < rows.length; i++) {
        if (rows[i].Code) { codes.push(rows[i].Code); }
    }
    return codes;
}

function batchSetFlag(flag) {
    var codes = getSelectedCodes();
    if (!codes.length) { toast('请先勾选要操作的记录', true); return; }
    var tip = (flag === 'Y')
        ? '确定要批量启用选中的 ' + codes.length + ' 条记录吗?'
        : '确定要批量停用选中的 ' + codes.length + ' 条记录吗?';
    if (!window.confirm(tip)) { return; }
    api('SetActiveFlagBatch', { CodeList: codes.join('^'), ActiveFlag: flag }, function(rs) {
        if (rs && rs.success) {
            toast(rs.msg || '操作成功');
            loadGrid(1, gPageSize);
        } else {
            toast((rs && rs.msg) || '操作失败', true);
        }
    });
}

/* ============================== Init ============================== */
$(function() {
    try { $('#btnQuery').linkbutton({ iconCls: 'icon-search' }); } catch(e1) {}
    try { $('#btnReset').linkbutton({}); } catch(e2) {}
    try { $('#btnAdd').linkbutton({ iconCls: 'icon-add' }); } catch(e3) {}
    try { $('#btnBatchOn').linkbutton({ iconCls: 'icon-ok' }); } catch(e4) {}
    try { $('#btnBatchOff').linkbutton({ iconCls: 'icon-cancel' }); } catch(e5) {}

    try {
        $('#dg').datagrid({
            fitColumns: true, singleSelect: false, striped: true,
            rownumbers: true, nowrap: true,
            pagination: true, pageSize: gPageSize, pageList: [20, 50, 100],
            rowStyler: function(index, row) {
                return (row.ActiveFlag === 'N') ? 'color:#999;' : '';
            },
            onBeforeLoad: function(param) { return false; }, // 手动 loadData
            columns: [[
                { checkbox: true, width: 30 },
                { field: 'Code',     title: '收费项代码', width: 110 },
                { field: 'TarId',    title: '收费项目ID', width: 90 },
                { field: 'TarDesc',  title: '收费项目描述', width: 220 },
                { field: 'OldCode',  title: '老码', width: 230 },
                { field: 'NewCode',  title: '新码', width: 230 },
                { field: 'StartDate', title: '开始日期', width: 95 },
                { field: 'EndDate',  title: '结束日期', width: 95 },
                { field: 'ActiveFlag', title: '可用标志', width: 80, align: 'center',
                  formatter: function(v) {
                      return (v === 'N')
                          ? '<span style="color:#c44;font-weight:600;">不可用</span>'
                          : '<span style="color:#2a8f2a;font-weight:600;">可用</span>';
                  }
                },
                { field: 'op', title: '操作', width: 130, align: 'center',
                  formatter: function(v, row) {
                      var html = '<a href="javascript:void(0)" style="color:#017bce;margin-right:10px;" onclick="openEditDlg(\'' + escQuote(row.Code) + '\')">修改</a>';
                      if (row.ActiveFlag === 'Y') {
                          html += '<a href="javascript:void(0)" style="color:#c44;" onclick="toggleFlag(\'' + escQuote(row.Code) + '\')">停用</a>';
                      } else {
                          html += '<a href="javascript:void(0)" style="color:#2a8f2a;" onclick="toggleFlag(\'' + escQuote(row.Code) + '\')">启用</a>';
                      }
                      return html;
                  }
                }
            ]]
        });
        var pager = $('#dg').datagrid('getPager');
        $(pager).pagination({
            onSelectPage: function(pageNo, pageSize) { gPageSize = pageSize; loadGrid(pageNo, pageSize); }
        });
    } catch(e6) {}

    loadGrid(1, gPageSize);
});
