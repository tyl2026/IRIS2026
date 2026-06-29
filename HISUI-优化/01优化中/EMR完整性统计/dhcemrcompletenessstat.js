﻿// dhcemrcompletenessstat.js - 电子病历书写完整率统计

var gv = {
    currentMode: 'date',       // 'date' | 'reg'
    currentFilter: null,       // 当前下钻过滤项
    allRows: [],               // 全部查询结果
    dg: null
};

$(function() {
    initUI();
});

// === 初始化 ===
function initUI() {
    // 默认日期
    var today = new Date();
    var weekAgo = new Date(today.getTime() - 7 * 86400000);
    $('#stDate').datebox('setValue', formatDate(weekAgo));
    $('#endDate').datebox('setValue', formatDate(today));

    // 科室 combobox
    $.q({
        ClassName: 'web.DHCExamPatList',
        QueryName: 'ctloclookupNew',
        desc: '', hospid: session['LOGON.HOSPID'],
        rows: 99999
    }, function(data) {
        $('#ctloc').combobox({
            valueField: 'ctlocid',
            textField: 'ctloc',
            editable: true,
            data: data.rows || data,
            filter: function(q, row) {
                var ct = row.ctloc || row.ctlocid || '';
                var al = row.Alias || '';
                return ct.toUpperCase().indexOf(q.toUpperCase()) >= 0
                    || al.toUpperCase().indexOf(q.toUpperCase()) >= 0;
            }
        });
    });

    // 医生 combobox
    $.q({
        ClassName: 'web.YZSY.DHCEmrCompleteness',
        QueryName: 'FindDoctor',
        rows: 99999
    }, function(data) {
        $('#doctor').combobox({
            valueField: 'RowID',
            textField: 'Name',
            editable: true,
            data: data.rows || data,
            filter: function(q, row) {
                return (row.Name || '').toUpperCase().indexOf(q.toUpperCase()) >= 0;
            }
        });
    });

    // DataGrid
    updateStatCards([], null);

    gv.dg = $('#dg').datagrid({
        fit: true, border: false,
        striped: false, singleSelect: true,
        fitColumns: false, autoRowHeight: true,
        rownumbers: true, pagination: true,
        pageSize: 50, pageList: [50, 100, 200],
        columns: [[
            {field:'RegNo',     title:'登记号',  width:90,  align:'center'},
            {field:'PatName',   title:'患者姓名', width:80,  align:'left'},
            {field:'AdmDate',   title:'就诊日期', width:85,  align:'center'},
            {field:'LocDesc',   title:'科室',     width:100, align:'left'},
            {field:'ChiefComplaint',     title:'主诉',      width:280, align:'left',
                formatter: truncateFormatter},
            {field:'CurrentMedHistory',  title:'现病史',    width:280, align:'left',
                formatter: truncateFormatter},
            {field:'Treatment', title:'治疗过程',  width:280, align:'left',
                formatter: truncateFormatter},
            {field:'Diagnosis', title:'诊断',      width:280, align:'left',
                formatter: truncateFormatter},
            {field:'Orders',    title:'医嘱',      width:80,  align:'center',
                formatter: flagFormatter},
            {field:'DoctorSign',title:'医师签名',  width:80,  align:'center',
                formatter: nameFlagFormatter},
            {field:'ChiefFlag', title:'主诉✓',    width:55, align:'center',
                formatter: checkFormatter},
            {field:'MedHistoryFlag', title:'现病✓',width:55, align:'center',
                formatter: checkFormatter},
            {field:'TreatmentFlag',  title:'治✓',  width:50, align:'center',
                formatter: checkFormatter},
            {field:'DiagFlag',title:'诊✓',        width:50, align:'center',
                formatter: checkFormatter},
            {field:'OrderFlag',title:'医✓',       width:50, align:'center',
                formatter: checkFormatter},
            {field:'SignFlag', title:'签✓',       width:50, align:'center',
                formatter: checkFormatter},
            {field:'AllOK',   title:'全项合格',    width:70, align:'center',
                formatter: allOKFormatter}
        ]],
        onRowContextMenu: function() { return false; }
    });
}

// === 模式切换 ===
function switchMode(mode) {
    gv.currentMode = mode;
    if (mode === 'date') {
        $('#modeDate').addClass('active');
        $('#modeReg').removeClass('active');
        $('#datePresets').show();
        $('#dateFields').show();
        $('#regNoFields').hide();
    } else {
        $('#modeDate').removeClass('active');
        $('#modeReg').addClass('active');
        $('#datePresets').hide();
        $('#dateFields').hide();
        $('#regNoFields').show();
    }
}

// === 日期预设 ===
function setDatePreset(preset) {
    var now = new Date();
    var start = new Date();
    if (preset === 'today') {
        // start = today 00:00
    } else if (preset === 'week') {
        start.setDate(now.getDate() - 7);
    } else if (preset === 'month') {
        start.setDate(1);
    } else if (preset === 'last') {
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        now = new Date(now.getFullYear(), now.getMonth(), 0);
    }
    $('#stDate').datebox('setValue', formatDate(start));
    $('#endDate').datebox('setValue', formatDate(now));
    // 高亮当前预设
    var btns = document.querySelectorAll('.date-preset');
    for (var i = 0; i < btns.length; i++) { btns[i].classList.remove('active'); }
    var evt = window.event || event;
    if (evt && evt.target) { evt.target.classList.add('active'); }
}

// === 查询 ===
function doQuery() {
    gv.currentFilter = null;
    updateStatCards(null, null);

    var params = {
        ClassName: 'web.YZSY.DHCEmrCompleteness',
        QueryName: 'FindOPEmrCompleteness',
        rows: 99999
    };

    if (gv.currentMode === 'reg') {
        params.SttDate = '';
        params.EndDate = '';
        params.RegNo = $('#regNo').val() || '';
        params.LocID = '';
        params.DocID = '';
    } else {
        params.SttDate = $('#stDate').datebox('getValue') || '';
        params.EndDate = $('#endDate').datebox('getValue') || '';
        params.RegNo = '';
        params.LocID = $('#ctloc').combobox('getValue') || '';
        params.DocID = $('#doctor').combobox('getValue') || '';
    }

    params.ChiefKey = (document.getElementById('txtChief') || {}).value || '';
    params.HistoryKey = (document.getElementById('txtHistory') || {}).value || '';
    params.TreatmentKey = (document.getElementById('txtTreatment') || {}).value || '';
    params.DiagKey = (document.getElementById('txtDiag') || {}).value || '';
    $.messager.progress({title: '请稍等', msg: '正在查询...'});

    $.q(params, function(gridData) {
        $.messager.progress('close');
        gv.allRows = gridData.rows || gridData || [];
        renderData(gv.allRows);
    }, function() {
        $.messager.progress('close');
        $.messager.alert('错误', '查询失败，请重试', 'error');
    });
}

// === 渲染数据到表格和卡片 ===
function renderData(rows) {
    // 计算全项合格标记
    for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        r.AllOK = (r.ChiefFlag == 1 && r.MedHistoryFlag == 1
            && r.TreatmentFlag == 1 && r.DiagFlag == 1
            && r.OrderFlag == 1 && r.SignFlag == 1) ? '✓' : '✗';
    }

    gv.dg.datagrid({loadFilter: DocToolsHUI.lib.pagerFilter}).datagrid('loadData', rows);
    gv.dg.datagrid('clearSelections');
    updateStatCards(rows, null);
}

// === 统计卡片 ===
function updateStatCards(rows, filterField) {
    if (!rows || rows.length === 0) {
        var html = '';
        var fields = ['ChiefFlag','MedHistoryFlag','TreatmentFlag','DiagFlag','OrderFlag','SignFlag'];
        var labels = ['主诉','现病史','治疗过程','诊断','医嘱','医师签名'];
        for (var i = 0; i < fields.length; i++) {
            html += buildCard(labels[i], 0, 0, fields[i], (filterField === fields[i]));
        }
        // 全项合格
        html += buildCardAll(0, 0, (filterField === 'AllOK'));
        document.getElementById('statCards').innerHTML = html;
        return;
    }

    var total = rows.length;
    var fields = ['ChiefFlag','MedHistoryFlag','TreatmentFlag','DiagFlag','OrderFlag','SignFlag'];
    var labels = ['主诉','现病史','治疗过程','诊断','医嘱','医师签名'];

    var html = '';
    for (var i = 0; i < fields.length; i++) {
        var cnt = 0;
        for (var j = 0; j < rows.length; j++) {
            if (rows[j][fields[i]] == 1) cnt++;
        }
        var pct = Math.round(cnt / total * 1000) / 10;
        html += buildCard(labels[i], cnt, pct, fields[i], (filterField === fields[i]));
    }

    // 全项合格
    var allCnt = 0;
    for (var j = 0; j < rows.length; j++) {
        if (rows[j].AllOK === '✓') allCnt++;
    }
    var allPct = Math.round(allCnt / total * 1000) / 10;
    html += buildCardAll(allCnt, allPct, (filterField === 'AllOK'));

    document.getElementById('statCards').innerHTML = html;
}

function buildCard(label, count, pct, field, isFiltered) {
    var color = getColor(pct);
    var cls = isFiltered ? ' filtered' : '';
    return '<div class="stat-card' + cls + '">'
        + '<div class="label">' + label + '</div>'
        + '<div class="pct" style="color:' + color + '">' + pct + '%</div>'
        + '<div class="bar"><div class="bar-fill" style="width:' + pct + '%;background:' + color + '"></div></div>'
        + '<div class="detail">' + count + '/' + (gv.allRows.length || 0) + '</div>'
        + '</div>';
}

function buildCardAll(count, pct, isFiltered) {
    var color = getColor(pct);
    var cls = isFiltered ? ' filtered' : '';
    return '<div class="stat-card' + cls + '">'
        + '<div class="label all">全项合格</div>'
        + '<div class="pct" style="color:' + color + '">' + pct + '%</div>'
        + '<div class="bar"><div class="bar-fill" style="width:' + pct + '%;background:' + color + '"></div></div>'
        + '<div class="detail">' + count + '/' + (gv.allRows.length || 0) + '</div>'
        + '</div>';
}

function getColor(pct) {
    if (pct >= 90) return '#4CAF50';
    if (pct >= 70) return '#FF9800';
    return '#F44336';
}

// === 下钻过滤 ===
function drillDown(field) {
    if (gv.currentFilter === field) {
        // 取消过滤
        gv.currentFilter = null;
        renderData(gv.allRows);
        return;
    }
    gv.currentFilter = field;

    var filtered = [];
    for (var i = 0; i < gv.allRows.length; i++) {
        var r = gv.allRows[i];
        if (field === 'AllOK') {
            if (r.AllOK !== '✓') filtered.push(r);
        } else {
            if (r[field] != 1) filtered.push(r);
        }
    }
    renderData(filtered);
    updateStatCards(filtered, field);
}

// === 导出 CSV ===
function doExport() {
    var rows = gv.dg.datagrid('getRows');
    if (rows.length === 0) {
        $.messager.alert('提示', '请先查询数据后再导出', 'info');
        return;
    }
    var headers = ['登记号','患者姓名','性别','年龄','就诊日期','科室','医生',
        '主诉','现病史','治疗过程','诊断','医嘱','医师签名',
        '主诉已写','现病史已写','治疗已写','诊断已写','医嘱已写','签名已写','全项合格'];
    var fields  = ['RegNo','PatName','Sex','Age','AdmDate','LocDesc','DocName',
        'ChiefComplaint','CurrentMedHistory','Treatment','Diagnosis','Orders','DoctorSign',
        'ChiefFlag','MedHistoryFlag','TreatmentFlag','DiagFlag','OrderFlag','SignFlag','AllOK'];

    var csv = '﻿' + headers.join(',') + '\n';
    for (var r = 0; r < rows.length; r++) {
        var rowArr = [];
        for (var f = 0; f < fields.length; f++) {
            var v = rows[r][fields[f]];
            v = (v != null) ? String(v).replace(/"/g, '""') : '';
            if (v.indexOf(',') > -1 || v.indexOf('"') > -1 || v.indexOf('\n') > -1) {
                v = '"' + v + '"';
            }
            rowArr.push(v);
        }
        csv += rowArr.join(',') + '\n';
    }

    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, 'EMR完整率统计_' + formatDate(new Date()) + '.csv');
    } else {
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'EMR完整率统计_' + formatDate(new Date()) + '.csv';
        link.click();
    }
}

// === 清空 ===
function doClear() {
    $('#stDate').datebox('setValue', '');
    $('#endDate').datebox('setValue', '');
    $('#ctloc').combobox('setValue', '');
    $('#doctor').combobox('setValue', '');
    $('#regNo').val('');
    resetTextFilter();
    gv.allRows = [];
    gv.currentFilter = null;
    gv.dg.datagrid('loadData', []);
    updateStatCards(null, null);
}

// === 文本筛选 ===
function textFilterChange() {
    doQuery();
}

function resetTextFilter() {
    var el;
    el = document.getElementById('txtChief'); if (el) el.value = '';
    el = document.getElementById('txtHistory'); if (el) el.value = '';
    el = document.getElementById('txtTreatment'); if (el) el.value = '';
    el = document.getElementById('txtDiag'); if (el) el.value = '';
}

// === Formatters ===
function truncateFormatter(value, row, index) {
    if (!value) return '<span style="color:#ccc">—</span>';
    var maxLen = 25;
    var display = value.length > maxLen ? value.substring(0, maxLen) + '...' : value;
    return '<span title="' + value.replace(/"/g, '&quot;') + '">' + display + '</span>';
}

function flagFormatter(value) {
    if (value && value !== '') return '<span style="color:#4CAF50">✓</span>';
    return '<span style="color:#F44336">✗</span>';
}

function nameFlagFormatter(value) {
    if (value && value !== '') return '<span style="color:#333">' + value + '</span>';
    return '<span style="color:#F44336">✗ 未签名</span>';
}

function checkFormatter(value) {
    if (value == 1) return '<span style="background:#E8F5E9;color:#2E7D32;padding:2px 6px;border-radius:3px;font-size:12px">✓</span>';
    return '<span style="background:#FFEBEE;color:#C62828;padding:2px 6px;border-radius:3px;font-size:12px">✗</span>';
}

function allOKFormatter(value) {
    if (value === '✓') return '<span style="background:#E8F5E9;color:#2E7D32;padding:2px 8px;border-radius:3px;font-weight:bold">✓ 合格</span>';
    return '<span style="background:#FFEBEE;color:#C62828;padding:2px 8px;border-radius:3px">✗ 不合格</span>';
}

// === 工具函数 ===
function formatDate(d) {
    var yyyy = d.getFullYear();
    var mm = String(d.getMonth() + 1);
    if (mm.length < 2) mm = '0' + mm;
    var dd = String(d.getDate());
    if (dd.length < 2) dd = '0' + dd;
    return yyyy + '-' + mm + '-' + dd;
}
