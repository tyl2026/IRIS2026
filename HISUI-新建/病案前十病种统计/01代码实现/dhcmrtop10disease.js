/**
 * 病案前十病种统计 — 前端逻辑
 * 参照 EMR完整性统计/dhcemrcompletenessstat.js 模式
 */

var gv = {
    currentView: 'top10',
    activePreset: 'month'
};

$(function () {
    initUI();
});

/* ========================================================================
 * 初始化
 * ======================================================================== */

function initUI() {
    // 先显式初始化 datebox，否则后续 setValue 报错
    $('#dtStt').datebox({});
    $('#dtEnd').datebox({});

    // 默认日期：本月
    setDatePreset('month');

    // ↓ datagrid 必须在 $.q 之前初始化，避免异步请求报错阻断渲染 ↓

    // datagrid — 报表2.1
    $('#dgTop10').datagrid({
        fit: true, border: false,
        striped: false, singleSelect: true,
        fitColumns: false, autoRowHeight: true,
        rownumbers: true, pagination: true,
        pageSize: 20, pageList: [10, 20, 50],
        columns: [[
            { field: 'Rank',          title: '排名',            width: 50,  align: 'center' },
            { field: 'ICD4Code',      title: 'ICD-10四位亚目',  width: 110, align: 'center' },
            { field: 'DiseaseName',   title: '病种名称',        width: 200, align: 'left' },
            { field: 'DisCount',      title: '出院人数',        width: 80,  align: 'center' },
            { field: 'DisPct',        title: '占出院比',        width: 80,  align: 'center' },
            { field: 'AvgLOS',        title: '平均住院日(天)',   width: 100, align: 'center' },
            { field: 'AvgCost',       title: '次均费用(元)',     width: 100, align: 'right',  formatter: costFmt },
            { field: 'MortalityRate', title: '病死率',          width: 70,  align: 'center', styler: rateStyler },
            { field: 'CureRate',      title: '治愈好转率',       width: 90,  align: 'center', styler: rateStyler },
            { field: 'YoYChange',     title: '同比增幅',         width: 80,  align: 'center', styler: yoyStyler }
        ]]
    });
    // 行点击 → 下钻明细
    $('#dgTop10').datagrid('options').onClickRow = function (index, row) {
        if (row && row.ICD4Code) drillDown(row.ICD4Code);
    };

    // datagrid — 报表2.2
    $('#dgTrend').datagrid({
        fit: true, border: false,
        striped: false, singleSelect: true,
        fitColumns: false, autoRowHeight: true,
        rownumbers: true, pagination: true,
        pageSize: 20, pageList: [10, 20, 50],
        columns: [[
            { field: 'ICD4Code',    title: 'ICD-10',    width: 100, align: 'center' },
            { field: 'DiseaseName', title: '病种名称',   width: 180, align: 'left' },
            { field: 'M1', title:'1月',width:50,align:'center'}, { field: 'M2', title:'2月',width:50,align:'center'},
            { field: 'M3', title:'3月',width:50,align:'center'}, { field: 'M4', title:'4月',width:50,align:'center'},
            { field: 'M5', title:'5月',width:50,align:'center'}, { field: 'M6', title:'6月',width:50,align:'center'},
            { field: 'M7', title:'7月',width:50,align:'center'}, { field: 'M8', title:'8月',width:50,align:'center'},
            { field: 'M9', title:'9月',width:50,align:'center'}, { field: 'M10',title:'10月',width:50,align:'center'},
            { field: 'M11',title:'11月',width:50,align:'center'},{ field: 'M12',title:'12月',width:50,align:'center'},
            { field: 'YearTotal',   title: '全年合计',    width: 80,  align: 'center' },
            { field: 'AvgMonth',    title: '月均',        width: 60,  align: 'center' },
            { field: 'YoYChange',   title: '同比增幅',    width: 80,  align: 'center', styler: yoyStyler }
        ]]
    });

    // 科室 combobox — $.q 放最后，避免其报错阻断 datagrid 初始化
    var hospid = (typeof session !== 'undefined' && session['LOGON.HOSPID']) || '';
    $.q({
        ClassName: 'web.DHCExamPatList',
        QueryName: 'ctloclookupNew',
        desc: '', hospid: hospid,
        rows: 99999
    }, function (data) {
        $('#selDept').combobox({
            valueField: 'ctlocid',
            textField: 'ctloc',
            editable: true,
            data: data.rows || data,
            filter: function (q, row) {
                var ct = row.ctloc || row.ctlocid || '';
                var al = row.Alias || '';
                return ct.toUpperCase().indexOf(q.toUpperCase()) >= 0
                    || al.toUpperCase().indexOf(q.toUpperCase()) >= 0;
            }
        });
    });
}

/* ========================================================================
 * 日期预设
 * ======================================================================== */

function setDatePreset(preset) {
    gv.activePreset = preset;

    var now = new Date();
    var start = new Date();
    var end = new Date();

    switch (preset) {
        case 'today':
            break;
        case 'week':
            start.setDate(now.getDate() - 7);
            break;
        case 'month':
            start.setDate(1);
            break;
        case 'quarter':
            var qm = Math.floor(now.getMonth() / 3) * 3;
            start = new Date(now.getFullYear(), qm, 1);
            break;
        case 'year':
            start = new Date(now.getFullYear(), 0, 1);
            break;
        case 'lastyear':
            start = new Date(now.getFullYear() - 1, 0, 1);
            end = new Date(now.getFullYear() - 1, 11, 31);
            break;
    }

    $('#dtStt').datebox('setValue', formatDate(start));
    $('#dtEnd').datebox('setValue', formatDate(end));

    // 高亮当前预设
    var btns = document.querySelectorAll('.date-preset');
    for (var i = 0; i < btns.length; i++) { btns[i].classList.remove('active'); }
    var el = document.querySelector('.date-preset[data-preset="' + preset + '"]');
    if (el && el.classList) { el.classList.add('active'); }
}

/* ========================================================================
 * 查询
 * ======================================================================== */

function doQuery() {
    var sttDate = $('#dtStt').datebox('getValue') || '';
    var endDate = $('#dtEnd').datebox('getValue') || '';
    var locID = $('#selDept').combobox('getValue') || '';

    if (!sttDate || !endDate) {
        $.messager.alert('提示', '请选择日期范围', 'info');
        return;
    }

    $.messager.progress({ title: '请稍等', msg: '正在查询...' });

    $.q({
        ClassName: 'web.YZSY.DHCMRTop10Disease',
        QueryName: 'QryTop10Disease',
        SttDate: sttDate, EndDate: endDate, LocID: locID,
        rows: 99999
    }, function (data) {
        var rs = data.rows || data || [];
        $('#dgTop10').datagrid('loadData', rs);
        // 查全院总人数
        $.q({
            ClassName: 'web.YZSY.DHCMRTop10Disease',
            QueryName: 'QryDisTotal',
            SttDate: sttDate, EndDate: endDate, LocID: locID,
            rows: 1
        }, function (td) {
            $.messager.progress('close');
            var totalAll = 0;
            var tdRows = td.rows || td || [];
            if (tdRows.length) totalAll = parseInt(tdRows[0].TotalDis) || 0;
            updateStatCards(rs, totalAll);
        }, function () {
            $.messager.progress('close');
            updateStatCards(rs, 0);
        });
    }, function () {
        $.messager.progress('close');
        $.messager.alert('错误', '查询失败，请重试', 'error');
    });

    // 趋势报表（仅当前视图为趋势时加载）
    if (gv.currentView === 'trend') {
        $.q({
            ClassName: 'web.YZSY.DHCMRTop10Disease',
            QueryName: 'QryTop10Trend',
            SttDate: sttDate, EndDate: endDate, LocID: locID,
            rows: 99999
        }, function (data) {
            var rs = data.rows || data || [];
            $('#dgTrend').datagrid('loadData', rs);
            renderTrendChart(rs);
        });
    }
}

/* ========================================================================
 * 下钻明细 + 趋势图
 * ======================================================================== */

function drillDownTop10() {
    var rows = $('#dgTop10').datagrid('getRows');
    if (!rows || !rows.length) { $.messager.alert('提示', '请先查询数据', 'info'); return; }
    var codes = [];
    for (var i = 0; i < rows.length; i++) {
        if (rows[i].ICD4Code) codes.push(rows[i].ICD4Code);
    }
    drillDown(codes.join(','));
}

function drillDown(icd4Code) {
    $.messager.progress({ title: '请稍等', msg: '加载明细...' });
    var stt = $('#dtStt').datebox('getValue') || '';
    var end = $('#dtEnd').datebox('getValue') || '';
    var loc = $('#selDept').combobox('getValue') || '';
    $.q({
        ClassName: 'web.YZSY.DHCMRTop10Disease',
        QueryName: 'QryDiseaseDetail',
        SttDate: stt, EndDate: end, LocID: loc, ICD4Code: icd4Code,
        rows: 99999
    }, function (data) {
        $.messager.progress('close');
        var rs = data.rows || data || [];
        if (!rs.length) { $.messager.alert('提示', '无数据', 'info'); return; }
        // 保存全量数据供导出
        gv.detailRows = rs;
        $('<div><table id="dgDetail"></table></div>').dialog({
            title: (icd4Code || '全院') + ' 出院患者明细 (' + rs.length + '人)',
            width: 940, height: 500, closed: false, modal: true,
            onClose: function () { $(this).dialog('destroy'); }
        });
        function pageData(page, size) {
            var s = (page - 1) * size;
            $('#dgDetail').datagrid('loadData', {
                total: gv.detailRows.length,
                rows: gv.detailRows.slice(s, s + size)
            });
        }
        $('#dgDetail').datagrid({
            fit: true, border: false, rownumbers: true,
            pagination: true, pageSize: 30,
            loadFilter: function (data) {
                if (data.total != null) return data;
                var p = $(this).datagrid('getPager');
                p.pagination({
                    total: data.length,
                    pageSize: 30,
                    onSelectPage: function (pn, ps) { pageData(pn, ps); }
                });
                return { total: data.length, rows: data.slice(0, 30) };
            },
            toolbar: [{
                text: '导出CSV',
                iconCls: 'icon-save',
                handler: function () { exportDetail(icd4Code); }
            }],
            columns: [[
                { field: 'PatName',   title: '患者姓名', width: 80 },
                { field: 'MedRecNo',  title: '病案号',   width: 90 },
                { field: 'MainDiag',  title: '主要诊断', width: 180 },
                { field: 'AdmDate',   title: '入院日期', width: 90 },
                { field: 'DisDate',   title: '出院日期', width: 90 },
                { field: 'DeptName',  title: '住院科室', width: 120 },
                { field: 'LOS',       title: '天数',     width: 60,  align: 'center' },
                { field: 'TotalCost', title: '总费用(元)',width: 100, align: 'right' },
                { field: 'DischCond', title: '出院情况', width: 80,  align: 'center' }
            ]]
        }).datagrid('loadData', rs);
    }, function () {
        $.messager.progress('close');
        $.messager.alert('错误', '查询失败', 'error');
    });
}

function exportDetail(icd4Code) {
    var rows = gv.detailRows;
    if (!rows || !rows.length) return;
    var cols = $('#dgDetail').datagrid('options').columns[0];
    var csv = '﻿' + icd4Code + ' 患者明细\n';
    var hdrs = []; for (var c = 0; c < cols.length; c++) hdrs.push(cols[c].title);
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
    if (navigator.msSaveBlob) { navigator.msSaveBlob(blob, icd4Code + '_明细.csv'); return; }
    var lnk = document.createElement('a'); lnk.href = URL.createObjectURL(blob);
    lnk.download = icd4Code + '_明细.csv'; document.body.appendChild(lnk); lnk.click(); document.body.removeChild(lnk);
}

function renderTrendChart(rows) {
    var dom = document.getElementById('chartTrend');
    if (!dom || !rows || !rows.length) return;
    if (typeof echarts === 'undefined') return;
    var chart = echarts.init(dom);
    var names = [], series = [];
    for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        names.push(r.DiseaseName);
        series.push({
            name: r.DiseaseName, type: 'line', smooth: true,
            data: [r.M1, r.M2, r.M3, r.M4, r.M5, r.M6, r.M7, r.M8, r.M9, r.M10, r.M11, r.M12]
        });
    }
    chart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: names, bottom: 0 },
        grid: { left: 55, right: 20, top: 20, bottom: 50 },
        xAxis: { type: 'category', data: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'] },
        yAxis: { type: 'value', name: '出院人数' },
        series: series
    });
}

/* ========================================================================
 * 统计卡片
 * ======================================================================== */

function updateStatCards(rows, totalAll) {
    if (!rows || !rows.length) {
        $('#cardTotal, #cardTop10Total, #cardTop10Pct, #cardAvgLOS, #cardAvgCost').text('--');
        return;
    }

    var top10Total = 0, wLOS = 0, wCost = 0, wCnt = 0;
    for (var i = 0; i < rows.length; i++) {
        var cnt = parseInt(rows[i].DisCount) || 0;
        top10Total += cnt;
        var los  = parseFloat(rows[i].AvgLOS)  || 0;
        var cost = parseFloat(rows[i].AvgCost) || 0;
        if (cnt > 0) { wLOS += los * cnt; wCost += cost * cnt; wCnt += cnt; }
    }

    // 全院总人数（后端查询，无数据时用前十合计占位）
    if (totalAll) {
        $('#cardTotal').text(formatNum(totalAll));
        $('#cardTop10Pct').text((top10Total / totalAll * 100).toFixed(1) + '%');
    } else {
        $('#cardTotal').text('--');
        $('#cardTop10Pct').text('--');
    }
    $('#cardTop10Total').text(formatNum(top10Total));

    if (wCnt > 0) {
        $('#cardAvgLOS').text((wLOS / wCnt).toFixed(1) + ' 天');
        $('#cardAvgCost').text(formatNum(Math.round(wCost / wCnt)) + ' 元');
    } else {
        $('#cardAvgLOS, #cardAvgCost').text('--');
    }
}

function formatNum(n) {
    if (!n && n !== 0) return '--';
    var s = String(n), r = '', c = 0;
    for (var i = s.length - 1; i >= 0; i--) {
        r = s.charAt(i) + r;
        if (++c % 3 === 0 && i > 0 && s.charAt(i - 1) !== '-') r = ',' + r;
    }
    return r;
}

/* ========================================================================
 * 视图切换
 * ======================================================================== */

function switchView(view) {
    gv.currentView = view;
    if (view === 'top10') {
        $('#tabTop10').addClass('active');
        $('#tabTrend').removeClass('active');
        $('#wrapTop10').show();
        $('#wrapTrend').hide();
        $('#dgTop10').datagrid('resize');
    } else {
        $('#tabTrend').addClass('active');
        $('#tabTop10').removeClass('active');
        $('#wrapTrend').show();
        $('#wrapTop10').hide();
        $('#dgTrend').datagrid('resize');
        doQuery();
    }
}

/* ========================================================================
 * 导出 CSV
 * ======================================================================== */

function doExport() {
    var dgId = gv.currentView === 'top10' ? '#dgTop10' : '#dgTrend';
    var rows = $(dgId).datagrid('getRows');
    if (!rows || !rows.length) {
        $.messager.alert('提示', '请先查询数据后再导出', 'info');
        return;
    }

    var cols = $(dgId).datagrid('options').columns[0];
    var title = gv.currentView === 'top10' ? '前十病种分布' : '前十病种趋势';
    var csv = '﻿' + title + '\n';

    var hdrs = [];
    for (var c = 0; c < cols.length; c++) hdrs.push(cols[c].title);
    csv += hdrs.join(',') + '\n';

    for (var r = 0; r < rows.length; r++) {
        var cells = [];
        for (var c2 = 0; c2 < cols.length; c2++) {
            var v = rows[r][cols[c2].field];
            if (v == null) v = '';
            v = String(v).replace(/"/g, '""');
            cells.push(v);
        }
        csv += cells.join(',') + '\n';
    }

    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, title + '_' + formatDate(new Date()) + '.csv');
    } else {
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = title + '_' + formatDate(new Date()) + '.csv';
        link.click();
    }
}

/* ========================================================================
 * 清空
 * ======================================================================== */

function doClear() {
    $('#dtStt').datebox('setValue', '');
    $('#dtEnd').datebox('setValue', '');
    $('#selDept').combobox('setValue', '');
    $('#dgTop10, #dgTrend').datagrid('loadData', []);
    updateStatCards([]);
}

/* ========================================================================
 * Formatters / Stylers
 * ======================================================================== */

function costFmt(value) {
    if (value == null || value === '') return '';
    var n = parseFloat(value); if (isNaN(n)) return String(value);
    return formatNum(Math.round(n));
}

function rateStyler(value) {
    if (value == null || value === '' || value === '-') return '';
    var n = parseFloat(value); if (isNaN(n)) return '';
    if (n > 5) return 'color:#cc0000;font-weight:bold;';
    if (n > 0) return 'color:#fd7201;';
    return 'color:#008000;';
}

function yoyStyler(value) {
    if (value == null || value === '-') return '';
    if (value.charAt(0) === '+') return 'color:#008000;';
    if (value.charAt(0) === '-') return 'color:#cc0000;';
    return '';
}

/* ========================================================================
 * 工具
 * ======================================================================== */

function formatDate(d) {
    var yyyy = d.getFullYear();
    var mm = String(d.getMonth() + 1); if (mm.length < 2) mm = '0' + mm;
    var dd = String(d.getDate());       if (dd.length < 2) dd = '0' + dd;
    return yyyy + '-' + mm + '-' + dd;
}
