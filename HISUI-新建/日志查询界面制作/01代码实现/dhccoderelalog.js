/**
 * 入库3563追溯码下载异常日志查询界面 — HISUI 前端逻辑
 * 数据来源: ^YZSY("SaveCodeRelaBy3563Excel",ingr)
 * IE11 compatible
 */
var gPageSize = 20;

/* ============================== AJAX ============================== */
function api(method, params, cb) {
    var data = { ClassName: 'web.YZSY.DHCCodeRelaLog', MethodName: method };
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

/* ============================== Params ============================== */
function inputVal(id) {
    var $el = $('#' + id);
    var v = '';
    try { v = $el.datebox('getValue'); } catch(e1) {}
    if (typeof v !== 'string' || v === '') { v = $el.val(); }
    return $.trim(v);
}

function getParams() {
    return {
        StartDate: inputVal('qStart'),
        EndDate:   inputVal('qEnd'),
        IngrNo:    inputVal('qIngrNo'),
        ApprovalNo: inputVal('qApprovalNo'),
        InsuCode:  inputVal('qInsuCode'),
        TarName:   inputVal('qTarName'),
        TarCode:   inputVal('qTarCode')
    };
}

/* ============================== Grid Load ============================== */
function loadGrid(page, rows) {
    var params = getParams();
    params.Page = page || 1;
    params.Rows = rows || gPageSize;
    api('QueryLog', params, function(rs) {
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
    $('#qIngrNo').val(''); $('#qApprovalNo').val(''); $('#qInsuCode').val('');
    $('#qTarName').val(''); $('#qTarCode').val('');
    var mStart = monthStartDash();
    var today = todayDash();
    try { $('#qStart').datebox('setValue', mStart); } catch(e1) {}
    try { $('#qEnd').datebox('setValue', today); } catch(e2) {}
    $('#qStart').val(mStart); $('#qEnd').val(today);
    loadGrid(1, gPageSize);
}

/* ============================== Export CSV ============================== */
function buildCsv(rows) {
    var csv = '\ufeff'; // BOM, Excel 打开中文不乱码
    var hdrs = ['入库单ID', '收费项ID', '收费项代码', '收费项名称', '入库单号', '供应商名称', '配送批次流水号', '医保编码', 'HIS医保对照信息', 'InsuConMatch', '保存日期', '入库日期'];
    csv += hdrs.join(',') + '\n';
    for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        var cells = [r.IngrId, r.TarId, r.TarCode, r.TarName, r.IngrNo, r.VendorName, r.ApprovalNo, r.InsuCode, r.InsuConInfo, r.InsuConMatch, r.SaveDate, r.IngrDate];
        var line = [];
        for (var j = 0; j < cells.length; j++) {
            var v = (cells[j] == null) ? '' : String(cells[j]);
            line.push('"' + v.replace(/"/g, '""') + '"');
        }
        csv += line.join(',') + '\n';
    }
    return csv;
}

function doExport() {
    var params = getParams();
    params.Page = 1;
    params.Rows = -1; // 全量
    api('QueryLog', params, function(rs) {
        var rows = (rs && rs.rows) ? rs.rows : [];
        if (!rows.length) { toast('没有可导出的数据', true); return; }
        var csv = buildCsv(rows);
        var fname = '入库3563追溯码下载异常日志_' + todayStr() + '.csv';
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        if (navigator.msSaveBlob) { navigator.msSaveBlob(blob, fname); return; }
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fname;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast('已导出 ' + rows.length + ' 条');
    });
}

function todayStr() {
    var d = new Date();
    var m = d.getMonth() + 1, day = d.getDate();
    return '' + d.getFullYear() + (m < 10 ? '0' + m : '' + m) + (day < 10 ? '0' + day : '' + day);
}

function todayDash() {
    var d = new Date();
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' + m : '' + m) + '-' + (day < 10 ? '0' + day : '' + day);
}

function monthStartDash() {
    var d = new Date();
    var m = d.getMonth() + 1;
    return d.getFullYear() + '-' + (m < 10 ? '0' + m : '' + m) + '-01';
}

/* ============================== Detail Dialog ============================== */
function showDetail(ingrId) {
    api('GetIngrDetail', { IngrId: ingrId }, function(rs) {
        if (!rs || !rs.main || !rs.main.IngrId) { toast('未获取到入库单信息', true); return; }
        var m = rs.main;
        // 每次重建弹窗容器（避免 datagrid 重复初始化导致表头不渲染）
        var old = document.getElementById('dlgDetail');
        if (old && old.parentNode) { old.parentNode.removeChild(old); }
        $('<div id="dlgDetail"><div class="dlg-inner">' +
          '<div class="dl-main-info" id="dlMainInfo"></div>' +
          '<table id="dgDetail"></table></div></div>').appendTo('body');

        var info = '';
        info += '<span>入库单ID：<b>' + escHtml(m.IngrId) + '</b></span>';
        info += '<span>入库单号：<b>' + escHtml(m.IngrNo) + '</b></span>';
        info += '<span>供应商：<b>' + escHtml(m.VendorName) + '</b></span>';
        info += '<span>入库科室：<b>' + escHtml(m.LocName) + '</b></span>';
        info += '<span>入库日期：<b>' + escHtml(m.CreateDate) + ' ' + escHtml(m.CreateTime) + '</b></span>';
        info += '<span>操作员：<b>' + escHtml(m.UserName) + '</b></span>';
        info += '<span>配送批次流水号：<b>' + escHtml(m.ApprovalNo) + '</b></span>';
        $('#dlMainInfo').html(info);

        // 先打开 dialog（容器可见）再初始化 datagrid
        $('#dlgDetail').dialog({
            title: '入库单明细 - ' + m.IngrNo, closed: false, modal: true,
            width: 860, top: 60,
            buttons: [{ text: '关闭', handler: function() { $('#dlgDetail').dialog('close'); } }]
        });
        var items = (rs.items && rs.items.length) ? rs.items : [];
        $('#dgDetail').datagrid({
            data: { total: items.length, rows: items },
            width: 820, height: 380,
            fitColumns: true, singleSelect: true, striped: true,
            rownumbers: true, nowrap: true, pagination: false,
            columns: [[
                { field: 'InciCode', title: '药品代码', width: 90 },
                { field: 'InciDesc', title: '药品名称', width: 220 },
                { field: 'BatNo',    title: '批号',    width: 130 },
                { field: 'ExpDate',  title: '有效期至', width: 90 },
                { field: 'Qty',      title: '数量',    width: 70, align: 'right' },
                { field: 'UomDesc',  title: '单位',    width: 60 },
                { field: 'Rp',       title: '进价',    width: 80, align: 'right' },
                { field: 'Amt',      title: '金额',    width: 90, align: 'right' }
            ]]
        });
    });
}

/* ============================== Utils ============================== */
function escHtml(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escQuote(s) { return String(s == null ? '' : s).replace(/\\/g,'\\\\').replace(/'/g,"\\'"); }

/* ============================== Init ============================== */
$(function() {
    try { $('#qStart').datebox({ formatter: function(d) { return d.getFullYear() + '-' + ((d.getMonth()+1)<10?'0':'') + (d.getMonth()+1) + '-' + (d.getDate()<10?'0':'') + d.getDate(); } }); } catch(e1) {}
    try { $('#qEnd').datebox({ formatter: function(d) { return d.getFullYear() + '-' + ((d.getMonth()+1)<10?'0':'') + (d.getMonth()+1) + '-' + (d.getDate()<10?'0':'') + d.getDate(); } }); } catch(e2) {}
    try { $('#btnQuery').linkbutton({ iconCls: 'icon-search' }); } catch(e3) {}
    try { $('#btnExport').linkbutton({ iconCls: 'icon-save' }); } catch(e4) {}
    var mStart = monthStartDash();
    var today = todayDash();
    try { $('#qStart').datebox('setValue', mStart); } catch(e51) {}
    try { $('#qEnd').datebox('setValue', today); } catch(e52) {}
    $('#qStart').val(mStart); $('#qEnd').val(today);

    try {
        $('#dg').datagrid({
            fitColumns: true, singleSelect: true, striped: true,
            rownumbers: true, nowrap: true,
            pagination: true, pageSize: gPageSize, pageList: [20, 50, 100],
            rowStyler: function(index, row) {
                // 对照医保编码与医保编码列一致 → 行背景绿色
                return (row.InsuConMatch === '1') ? 'background:#d4efdf;' : '';
            },
            onBeforeLoad: function(param) { return false; }, // 手动 loadData
            columns: [[
                { field: 'IngrId',     title: '入库单ID', width: 80 },
                { field: 'TarId',      title: '收费项ID', width: 80 },
                { field: 'TarCode',    title: '收费项代码', width: 110 },
                { field: 'TarName',    title: '收费项名称', width: 200 },
                { field: 'IngrNo',     title: '入库单号', width: 140,
                  formatter: function(v, row) {
                      return '<a href="javascript:void(0)" style="color:#017bce;text-decoration:underline;" onclick="showDetail(\'' + escQuote(row.IngrId) + '\')">' + escHtml(v) + '</a>';
                  }
                },
                { field: 'VendorName', title: '供应商名称', width: 160 },
                { field: 'ApprovalNo', title: '配送批次流水号', width: 150 },
                { field: 'InsuCode',   title: '医保编码', width: 130 },
                { field: 'InsuConInfo', title: 'HIS医保对照信息', width: 320 },
                { field: 'SaveDate',   title: '保存日期', width: 95 },
                { field: 'IngrDate',   title: '入库日期', width: 95 }
            ]]
        });
        var pager = $('#dg').datagrid('getPager');
        $(pager).pagination({
            onSelectPage: function(pageNo, pageSize) { gPageSize = pageSize; loadGrid(pageNo, pageSize); }
        });
    } catch(e5) {}

    loadGrid(1, gPageSize);
});
