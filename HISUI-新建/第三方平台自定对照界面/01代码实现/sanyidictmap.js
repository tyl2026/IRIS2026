/**
 * 通用数据采集字典与 HIS 字典对照维护 — HISUI 前端逻辑
 * 后端: web.YZSY.DHCSYDictMap
 * 存储: ^YZSY("SYDictMap", ...)
 * 设计要点: 未绑定 HIS 字典的值域需要先在【字典导入维护】中注册 HIS 字典（或在
 *           对照维护主面板【维护HIS字典】弹窗里就地把字典注册并绑定），绑定后
 *           才能进入字典对照流程；不再保留手工录入路径。
 * IE11 compatible
 */
var CLS = 'web.YZSY.DHCSYDictMap';

var gPlat      = 'SY';      // 当前平台
var gDomain    = null;      // 当前选中的值域行
var gItem      = null;      // 当前选中的采集条目行
var gCurCodes  = {};        // 当前条目已对照的 HIS 代码集合
var gPageSize  = 20;
var gRelSize   = 50;
var gCovSize   = 50;
var gHisPage   = 1;
var gItemPage  = 1;

var gDomainHisCodes = {};      // 当前值域下已被任何采集条目对照过的 HIS 代码集合(数组)

/* ============================== AJAX ============================== */
function api(method, params, cb) {
    var data = { ClassName: CLS, MethodName: method };
    for (var k in params) {
        if (params.hasOwnProperty(k)) { data[k] = params[k]; }
    }
    $m(data, function(txt) {
        var rs = {};
        if (typeof txt === 'string') {
            try { rs = JSON.parse(txt); } catch(e) { rs = {}; }
        } else if (txt && typeof txt === 'object') {
            rs = txt;
        }
        if (cb) { cb(rs); }
    });
}

/* 原始文本返回(导出 CSV 用) */
function apiRaw(method, params, cb) {
    var data = { ClassName: CLS, MethodName: method };
    for (var k in params) {
        if (params.hasOwnProperty(k)) { data[k] = params[k]; }
    }
    $m(data, function(txt) {
        if (cb) { cb(typeof txt === 'string' ? txt : ''); }
    });
}

/* ============================== 通用 ============================== */
function toast(msg, err) {
    var el = $('<div></div>').text(msg).css({
        position: 'fixed', top: '18px', left: '50%', transform: 'translateX(-50%)',
        background: err ? '#d44' : '#15428b', color: '#fff',
        padding: '10px 28px', borderRadius: '4px', fontSize: '14px',
        zIndex: 99999, boxShadow: '0 2px 12px rgba(0,0,0,0.18)'
    }).appendTo('body');
    el.fadeIn(200).delay(1800).fadeOut(400, function() { el.remove(); });
}

function val(id) {
    var v = $('#' + id).val();
    return $.trim(v == null ? '' : v);
}
function escHtml(s) {
    return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escQ(s) {
    return String(s == null ? '' : s).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'&quot;');
}
function flagText(v) {
    return (v === 'N')
        ? '<span style="color:#c44;font-weight:600;">停用</span>'
        : '<span style="color:#2a8f2a;font-weight:600;">启用</span>';
}
function modeText(v) {
    /* v 可为空(未绑定) 或 D(已绑定字典) */
    if (!v) { return '<span style="color:#c44;">未绑定</span>'; }
    return '<span style="color:#017bce;">字典对照</span>';
}
function bindBadge(row) {
    if (!row || !row.HisDictCode) {
        return '<span style="color:#c44;">未绑定HIS字典</span>';
    }
    return '<span style="color:#2a8f2a;">已绑定 · ' + escHtml(row.HisDictName || row.HisDictCode) + '(' + escHtml(row.HisDictCode) + ')</span>';
}
function getGrid(id) {
    try { return $('#' + id); } catch(e) { return null; }
}

/* ============================== 平台下拉 ============================== */
function loadPlatCombo(cb) {
    /* 用同一个拉取结果同时填三处下拉:
       顶部平台选择 / 字典导入平台选择 / 对照查询平台筛选(只显示启用) */
    api('QueryPlatform', { Keyword: '', ActiveFlag: '', Page: 1, Rows: 0 }, function(rs) {
        var list = (rs && rs.rows) ? rs.rows : [];
        var allOpts = '';
        var activeOpts = '';
        var firstActive = '';
        for (var i = 0; i < list.length; i++) {
            var p = list[i];
            var label = escHtml(p.PlatName) + '(' + escHtml(p.PlatCode) + ')';
            allOpts += '<option value="' + escQ(p.PlatCode) + '">' + label + '</option>';
            if (p.ActiveFlag !== 'N') {
                activeOpts += '<option value="' + escQ(p.PlatCode) + '">' + label + '</option>';
                if (!firstActive) { firstActive = p.PlatCode; }
            }
        }
        if (activeOpts === '') {
            activeOpts = '<option value="">暂无可用平台</option>';
        }
        /* 字典导入 Tab 仍保留全部选项(含已停用, 导入后自动启用即可) */
        $('#gPlat').html(allOpts);
        $('#impPlat').html(allOpts);
        /* 对照关系查询 Tab 只列已启用平台 */
        $('#rPlat').html(activeOpts);
        if (firstActive) {
            gPlat = firstActive;
            $('#rPlat').val(firstActive);
        }
        if (list.length && list[0].PlatCode) { gPlat = list[0].PlatCode; }
        $('#gPlat').val(gPlat);
        $('#impPlat').val(gPlat);
        /* 进入时同步刷新值域下拉 */
        loadQueryDomainSel();
        if (cb) { cb(); }
    });
}

/* Tab2 进入时按需刷新平台下拉 */
function refreshRelPlat(cb) {
    api('QueryPlatform', { Keyword: '', ActiveFlag: 'Y', Page: 1, Rows: 0 }, function(rs) {
        var list = (rs && rs.rows) ? rs.rows : [];
        var opts = '';
        for (var i = 0; i < list.length; i++) {
            opts += '<option value="' + escQ(list[i].PlatCode) + '">' +
                escHtml(list[i].PlatName) + '(' + escHtml(list[i].PlatCode) + ')</option>';
        }
        $('#rPlat').html(opts || '<option value="">暂无可用平台</option>');
        loadQueryDomainSel();
        if (cb) { cb(); }
    });
}

/* ============================== 值域下拉(查询 Tab, 随平台联动) ============================== */
function loadQueryDomainSel() {
    var plat = $('#rPlat').val() || gPlat;
    if (!plat) { $('#rDomainSel').html('<option value="">全部</option>'); return; }
    api('QueryDomain', { PlatCode: plat, Keyword: '', MapFlag: '', Page: 1, Rows: 0 }, function(rs) {
        var list = (rs && rs.rows) ? rs.rows : [];
        var opts = '<option value="">全部</option>';
        for (var i = 0; i < list.length; i++) {
            var d = list[i];
            opts += '<option value="' + escQ(d.DomainCode) + '">' +
                escHtml(d.DomainCode + ' ' + d.DomainName).slice(0, 60) + '</option>';
        }
        $('#rDomainSel').html(opts);
    });
}

/* 用户操作时: 选了精确值域 → 清掉自由文本以避免冲突; 反之亦然 */
function onRDomainSelChange() {
    var sel = $('#rDomainSel').val();
    if (sel) { $('#rDomain').val(''); }
}
function onRDomainInput() {
    if ($('#rDomain').val()) { $('#rDomainSel').val(''); }
}

/* ============================== Tab1: 值域列表 ============================== */
function loadDomain(page) {
    api('QueryDomain', {
        PlatCode: gPlat, Keyword: val('qDomain'), MapFlag: val('qMapFlag'),
        Page: page || 1, Rows: gPageSize
    }, function(rs) {
        var total = (rs && rs.total) ? rs.total : 0;
        var rows  = (rs && rs.rows)  ? rs.rows  : [];
        try {
            $('#dgDomain').datagrid('loadData', { total: total, rows: rows });
            var pager = $('#dgDomain').datagrid('getPager');
            $(pager).pagination({
                total: total, pageNumber: (page || 1), pageSize: gPageSize, pageList: [20, 50, 100]
            });
        } catch(e) {}
        $('#domainStat').text('共 ' + total + ' 个值域');
    });
}

function resetDomain() {
    $('#qDomain').val('');
    $('#qMapFlag').val('');
    loadDomain(1);
}

function selectDomain(row) {
    gDomain = row;
    gItem = null;
    gCurCodes = {};
    gDomainHisCodes = [];
    $('#itemTip').text(row ? ('  值域：' + row.DomainCode + ' ' + row.DomainName) : '');
    try { $('#dgItem').datagrid('loadData', { total: 0, rows: [] }); } catch(e1) {}
    try { $('#dgCurRel').datagrid('loadData', { total: 0, rows: [] }); } catch(e2) {}
    try { $('#dgHis').datagrid('loadData', { total: 0, rows: [] }); } catch(e3) {}
    $('#curRelTip').text('');
    applyMapMode();
    if (row && row.HisDictCode) {
        /* 值域切换时同步重置显示模式为默认「仅未对照」, 避免上一次残留状态干扰 */
        try { $('#qHisShowMode').val('N'); } catch(_z) {}
        loadItem(1);
    }
}

/* 按值域的 HIS 字典绑定情况切换右侧面板 */
function applyMapMode() {
    var $hd = $('#hisDictBox');
    var $ub = $('#unbindBox');
    if (!gDomain) {
        $('#hisModeTag').removeClass('warn').text('未选择值域');
        $('#hisPaneTitle').text('HIS 字典');
        $hd.hide(); $ub.hide();
        return;
    }
    if (gDomain.HisDictCode) {
        $('#hisModeTag').removeClass('warn').text('字典对照 · ' + (gDomain.HisDictName || gDomain.HisDictCode) + '(' + gDomain.HisDictCode + ')');
        $('#hisPaneTitle').text('HIS 字典：' + (gDomain.HisDictName || ''));
        $ub.hide(); $hd.show();
        loadHis(1);
    } else {
        $('#hisModeTag').addClass('warn').text('未绑定HIS字典');
        $('#hisPaneTitle').text('请先维护 HIS 字典');
        $hd.hide(); $ub.show();
        /* 卸载项仅在绑定后才显示对照，绑定前禁止误点保存 */
    }
}

/* ============================== Tab1: 采集条目 ============================== */
function loadItem(page) {
    if (!gDomain) { return; }
    gItemPage = page || 1;
    api('QueryDomainItem', {
        PlatCode: gPlat, DomainCode: gDomain.DomainCode,
        Keyword: val('qItem'), MapFlag: val('qItemMapFlag'),
        Page: gItemPage, Rows: gPageSize
    }, function(rs) {
        var total = (rs && rs.total) ? rs.total : 0;
        var rows  = (rs && rs.rows)  ? rs.rows  : [];
        try {
            $('#dgItem').datagrid('loadData', { total: total, rows: rows });
            var pager = $('#dgItem').datagrid('getPager');
            $(pager).pagination({
                total: total, pageNumber: gItemPage, pageSize: gPageSize, pageList: [20, 50, 100]
            });
        } catch(e) {}
    });
}

function selectItem(row) {
    gItem = row;
    if (!row) { return; }
    loadCurRel(function() {
        if (gDomain && gDomain.HisDictCode) { loadHis(1); }
    });
}

/* 当前条目的对照关系 */
function loadCurRel(cb) {
    if (!gItem) { if (cb) { cb(); } return; }
    api('QueryItemRel', { PlatCode: gPlat, DomainCode: gDomain.DomainCode, ItemCode: gItem.ItemCode }, function(rs) {
        var rows = (rs && rs.rows) ? rs.rows : [];
        gCurCodes = {};
        for (var i = 0; i < rows.length; i++) { gCurCodes[rows[i].HisCode] = 1; }
        try { $('#dgCurRel').datagrid('loadData', { total: rows.length, rows: rows }); } catch(e) {}
        $('#curRelTip').text('  条目：' + gItem.ItemCode + ' ' + (gItem.ItemName || '') + '，共 ' + rows.length + ' 条对照');
        updateSelTip();
        if (cb) { cb(); }
    });
}

/* ============================== Tab1: HIS 字典 ============================== */
function loadHis(page) {
    if (!gDomain || !gDomain.HisDictCode) { return; }
    gHisPage = page || 1;
    var mf = (val('qHisShowMode') || 'N').toUpperCase();
    if (mf !== 'A' && mf !== 'M') { mf = 'N'; }
    api('QueryHisDictItem', {
        PlatCode: gPlat, DomainCode: gDomain.DomainCode, DictCode: gDomain.HisDictCode,
        Keyword: val('qHis'), Page: gHisPage, Rows: gRelSize, MappedFilter: mf
    }, function(rs) {
        var total = (rs && rs.total) ? rs.total : 0;
        var rows  = (rs && rs.rows)  ? rs.rows  : [];
        if (rs && rs.success === false) { toast(rs.msg || '读取HIS字典失败', true); }
        /* 把后端返回的 mappedCnt 同步到 gDomainHisCodes, 供 saveDictRel 等处使用 */
        if (rs && rs.mappedCnt != null) { gDomainHisCodes = []; } /* 实际行级 isMapped 已够用, 这里只保留统计 */
        try {
            $('#dgHis').datagrid('loadData', { total: total, rows: rows });
            var pager = $('#dgHis').datagrid('getPager');
            $(pager).pagination({
                total: total, pageNumber: gHisPage, pageSize: gRelSize, pageList: [50, 100, 200]
            });
        } catch(e) {}
        if (rs && rs.success === false && rs.msg) { toast(rs.msg, true); }
    });
}

/* 载入后回显已对照的行: 后端已经按 MappedFilter 过滤 + 每行带 isMapped, 这里做 UI 标记与禁用 */
function onHisLoadSuccess(data) {
    var rows = (data && data.rows) ? data.rows : [];
    for (var i = 0; i < rows.length; i++) {
        var code = String(rows[i].Code || '');
        var isMapped = rows[i].isMapped === 1 || rows[i].isMapped === '1';
        if (isMapped) {
            rows[i].__relHit = true;
            try {
                var $tr = $('#dgHis').find('.dg-wrap tbody tr[data-i=' + i + ']');
                $tr.addClass('rel-hit rel-locked');
                var $ck = $tr.find('.dg-ck');
                if ($ck.length) {
                    $ck.prop('disabled', true).attr('title', '该 HIS 代码已被其他采集条目对照, 不能再重复对照');
                }
            } catch(e2) {}
        }
        /* 当前条目已对照: 自动勾选(允许同条目多选) */
        if (gCurCodes[code]) {
            try { $('#dgHis').datagrid('checkRow', i); } catch(e) {}
        }
    }
    updateSelTip();
}

/* 加载当前值域下已被任意条目对照过的 HIS 代码集合 */
function loadDomainHisCodes(cb) {
    if (!gDomain || !gDomain.DomainCode) { if (cb) { cb(); } return; }
    api('QueryDomainHisCodes', { PlatCode: gPlat, DomainCode: gDomain.DomainCode }, function(rs) {
        var list = (rs && rs.success && rs.HisCodes) ? rs.HisCodes.split('^') : [];
        gDomainHisCodes = list.filter(function(c) { return c !== ''; });
        if (cb) { cb(); }
    });
}

function updateSelTip() {
    var n = 0;
    try { n = $('#dgHis').datagrid('getSelections').length; } catch(e) {}
    $('#selTip').text('已选 ' + n + ' 项');
}

function saveDictRel() {
    if (!gItem) { toast('请先在左侧选择采集字典条目', true); return; }
    if (!gDomain || !gDomain.HisDictCode) { toast('当前值域未绑定HIS字典，请先维护', true); return; }
    var sels = [];
    try { sels = $('#dgHis').datagrid('getSelections'); } catch(e) {}
    if (!sels.length) {
        if (!window.confirm('未勾选任何 HIS 字典项，确定要清空该条目的全部对照吗？')) { return; }
    }
    var codes = [];
    for (var i = 0; i < sels.length; i++) { codes.push(sels[i].Code); }
    var mode = document.getElementById('ckAppend').checked ? 'A' : 'O';
    api('SaveDictRel', {
        PlatCode: gPlat, DomainCode: gDomain.DomainCode, ItemCode: gItem.ItemCode,
        HisCodes: codes.join('^'), Mode: mode
    }, function(rs) {
        if (rs && rs.success) {
            toast(rs.msg || '保存成功');
            loadCurRel(function() { loadHis(gHisPage); });
            loadItem(1);
        } else {
            toast((rs && rs.msg) || '保存失败', true);
        }
    });
}

function clearRel() {
    if (!gItem) { toast('请先选择采集字典条目', true); return; }
    if (!window.confirm('确定清空【' + gItem.ItemCode + ' ' + (gItem.ItemName || '') + '】的全部对照吗？')) { return; }
    api('ClearRel', { PlatCode: gPlat, DomainCode: gDomain.DomainCode, ItemCode: gItem.ItemCode }, function(rs) {
        if (rs && rs.success) {
            toast(rs.msg || '已清空');
            loadCurRel(function() { loadHis(gHisPage); });
            loadItem(1);
        } else {
            toast((rs && rs.msg) || '操作失败', true);
        }
    });
}

/* 批量清空多个采集条目下的全部对照
   - 优先取 dgItem 中勾选的行, 没勾选则取当前选中行(单条)
   - 弹确认 + 统计条目 / 对照条数后清空 */
function clearRelBatch() {
    if (!gDomain) { toast('请先在左侧选择一个值域', true); return; }
    var sels = [];
    try { sels = $('#dgItem').datagrid('getChecked'); } catch(e1) {}
    /* 如果没勾选, 降级用 getSelections (用于单选模式兼容) */
    if (!sels.length) { try { sels = $('#dgItem').datagrid('getSelections'); } catch(e2) {} }
    if (!sels.length) { toast('请先在左侧【采集字典条目】中勾选要清除的条目', true); return; }
    /* 去重 + 过滤同条目 (Code 同视为同一项) */
    var seen = {}, list = [];
    for (var i = 0; i < sels.length; i++) {
        var c = String(sels[i].ItemCode || '');
        if (!c || seen[c]) { continue; }
        seen[c] = true;
        list.push({ ItemCode: c, ItemName: sels[i].ItemName || '', RelCnt: sels[i].RelCnt || 0 });
    }
    var totalRels = 0;
    for (var j = 0; j < list.length; j++) { totalRels += (list[j].RelCnt | 0); }
    var head = list.length <= 5
        ? list.map(function(x) { return x.ItemCode + (x.ItemName ? ' ' + x.ItemName : ''); }).join('\n  · ')
        : (list.slice(0, 5).map(function(x) { return x.ItemCode + (x.ItemName ? ' ' + x.ItemName : ''); }).join('\n  · ')
           + '\n  · ... 共 ' + list.length + ' 个条目');
    var msg = '将清空以下 ' + list.length + ' 个采集条目下的全部对照关系（共 ' + totalRels + ' 条 HIS 对照），\n此操作不可撤销。\n\n  · ' + head + '\n\n是否继续？';
    if (!window.confirm(msg)) { return; }
    api('ClearRelBatch', {
        PlatCode: gPlat, DomainCode: gDomain.DomainCode,
        ItemList: list.map(function(x) { return x.ItemCode; }).join('^')
    }, function(rs) {
        if (rs && rs.success) {
            toast(rs.msg || '已清空');
            /* 清空 dgCurRel / dgItem 勾选状态, 刷新数据 */
            try { $('#dgItem').datagrid('uncheckAll'); } catch(eu) {}
            loadItem(gItemPage || 1);
            loadCurRel(function() { loadHis(gHisPage); });
        } else {
            toast((rs && rs.msg) || '操作失败', true);
        }
    });
}

function refreshDesc() {
    if (!gDomain) { toast('请先选择值域', true); return; }
    api('RefreshRelDesc', { PlatCode: gPlat, DomainCode: gDomain.DomainCode }, function(rs) {
        if (rs && rs.success) {
            toast(rs.msg || '刷新完成');
            loadCurRel();
        } else {
            toast((rs && rs.msg) || '刷新失败', true);
        }
    });
}

/* 当前对照行：修改 / 删除 / 启停 */
function editCurRel(code) {
    var rows = [];
    try { rows = $('#dgCurRel').datagrid('getRows'); } catch(e) {}
    var row = null;
    for (var i = 0; i < rows.length; i++) { if (rows[i].HisCode === code) { row = rows[i]; } }
    if (!row) { toast('未找到该对照记录', true); return; }
    openRelEditDlg(row);
}

function deleteCurRel(code) {
    if (!window.confirm('确定删除对照【' + code + '】吗？')) { return; }
    api('DeleteRel', {
        PlatCode: gPlat, DomainCode: gDomain.DomainCode,
        ItemCode: gItem.ItemCode, HisCode: code
    }, function(rs) {
        if (rs && rs.success) {
            toast('删除成功');
            loadCurRel(function() { loadHis(gHisPage); });
            loadItem(1);
        } else {
            toast((rs && rs.msg) || '删除失败', true);
        }
    });
}

/* ============================== 维护值域的 HIS 字典 ============================== */
/* mode:
 *   缺省/任意 — 显示完整的"绑定+新建"双栏弹窗
 *   'pick'    — 直接进入"绑定已有"分页
 *   'new'     — 直接进入"就地新增"分页
 * opts:
 *   onSave(tabIdx, payload, cb): 自定义保存动作; 不传则走默认(原值域未绑定时的简单保存)
 *   title: 自定义弹窗标题; 不传则用 '维护值域对应的 HIS 字典表'
 */
function openBindDlg(mode, opts) {
    if (!gDomain) { toast('请先在左侧选择一个值域', true); return; }
    opts = opts || {};
    var html = ''
        + '<div class="dlg-inner">'
        +   '<div class="dl-row"><label>值域代码</label><input id="bdCode" readonly></div>'
        +   '<div class="dl-row"><label>值域名称</label><input id="bdName" readonly></div>'
        +   '<div class="dl-row" id="bdCurRow" style="display:none;"><label>当前绑定</label><input id="bdCur" readonly style="background:#fffbe6;"></div>'
        +   '<div class="dlg-tabs" id="bdTabs">'
        +     '<div title="绑定已有HIS字典">'
        +       '<div class="dl-row" style="margin-top:8px;">'
        +         '<label>选择 HIS 字典表（绑定后即可开始对照）</label>'
        +         '<select id="bdDict"></select>'
        +       '</div>'
        +     '</div>'
        +     '<div title="就地新增 HIS 字典">'
        +       '<div class="dl-divider">1. 取数方式</div>'
        +       '<div class="dl-row">'
        +         '<select id="bdMode">'
        +           '<option value="S">SQL 查询（标准 SQL 表）</option>'
        +           '<option value="E">枚举（直接列出 code=desc）</option>'
        +         '</select>'
        +       '</div>'
        +       '<div class="dl-divider">2. 字典信息</div>'
        +       '<div class="dl-2">'
        +         '<div class="dl-row"><label><span style="color:red">*</span>字典代码</label><input id="bdNewCode" placeholder="如 CT_NATION"></div>'
        +         '<div class="dl-row"><label><span style="color:red">*</span>字典名称</label><input id="bdNewName" placeholder="如 民族字典"></div>'
        +       '</div>'
        +       '<div class="dl-divider">3. 取数内容（按方式填写）</div>'
        +       '<div id="bdSqlBox" class="dl-row">'
        +         '<label>SQL 语句（结果需含 code / desc 列，可选项含 WHERE；列名按需要用 AS 重命名）</label>'
        +         '<textarea id="bdSql" rows="6" style="font-family:Consolas,monospace;" placeholder="例: SELECT CTNAT_Code AS code, CTNAT_Desc AS desc FROM CT_Nation"></textarea>'
        +         '<div class="hint">支持 TOP n；预览效果见【探测】。</div>'
        +       '</div>'
        +       '<div id="bdEnumBox" class="dl-row" style="display:none;">'
        +         '<label>枚举项（每行 <code>代码=名称</code>，# 开头为注释）</label>'
        +         '<textarea id="bdEnum" rows="6" style="font-family:Consolas,monospace;" placeholder="1=是\n2=否"></textarea>'
        +       '</div>'
        +       '<div class="dl-row"><label>备注</label><input id="bdNewMemo" placeholder="可选"></div>'
        +     '</div>'
        +   '</div>'
        + '</div>';
    var title = opts.title || '维护值域对应的 HIS 字典表';
    showDlg('dlgBind', title, html, 620, function() {
        $('#bdCode').val(gDomain.DomainCode);
        $('#bdName').val(gDomain.DomainName || '');
        if (gDomain.HisDictCode) {
            $('#bdCur').val((gDomain.HisDictName || '') + '(' + gDomain.HisDictCode + ')');
            $('#bdCurRow').show();
        }
        bindDictLookup();
        toggleBindMode();
        $('#bdMode').off('change').on('change', toggleBindMode);
        $('#bdTabs').tabs({
            onSelect: function(title2, index) {
                if (index === 1) { setTimeout(toggleBindMode, 0); }
            }
        });
        if (mode === 'pick') { $('#bdTabs').tabs('select', 0); }
        else if (mode === 'new') { $('#bdTabs').tabs('select', 1); }
    }, function() {
        /* 保存按钮：根据当前选中的 Tab 走分支 */
        var tabIdx = 0;
        try { tabIdx = $('#bdTabs').tabs('getSelected').index(); } catch(e1) {}
        if (opts.onSave) {
            /* 自定义保存流程(已绑定值域, 需要确认清空) */
            opts.onSave(tabIdx, {
                pickDict: val('bdDict'),
                newMode:  val('bdMode'),
                newCode:  val('bdNewCode'),
                newName:  val('bdNewName'),
                newSql:   val('bdSql'),
                newEnum:  val('bdEnum'),
                newMemo:  val('bdNewMemo')
            }, function(rs) {
                if (rs && rs.success) {
                    closeDlg('dlgBind');
                    afterBindSaved(rs);
                } else {
                    toast((rs && rs.msg) || '保存失败', true);
                }
            });
            return;
        }
        if (tabIdx === 0) {
            api('SaveDomainHisDict', {
                PlatCode: gPlat, DomainCode: gDomain.DomainCode, HisDictCode: val('bdDict')
            }, function(rs) { afterBindSaved(rs); });
        } else {
            saveBindNewDict(function(rs) {
                if (rs && rs.success) {
                    afterBindSaved({ success: true, msg: '字典已新增并绑定' });
                } else {
                    toast((rs && rs.msg) || '保存失败', true);
                }
            });
        }
    });
}

/* 从任何已绑定值域进入"维护 HIS 字典绑定" — 复用 openBindDlg 弹窗,
   但保存时若切换到不同的 HIS 字典 (或解除绑定), 弹确认是否清空原对照 */
function changeBindDlg() {
    if (!gDomain) { toast('请先在左侧选择一个值域', true); return; }
    if (!gDomain.DomainCode) { toast('无效的值域', true); return; }
    var oldDict = (gDomain.HisDictCode || '').trim();
    openBindDlg(undefined, {
        title: '维护 HIS 字典绑定（值域：' + gDomain.DomainCode + '）',
        onSave: function(tabIdx, p, cb) {
            /* 解析用户实际选择的 HIS 字典代码 */
            var newDict = '';
            if (tabIdx === 0) {
                newDict = (p.pickDict || '').trim();
            } else {
                newDict = (p.newCode || '').trim();
            }
            var changed = (oldDict !== newDict);
            if (!changed) {
                /* 没有变化, 直接提示并关闭 */
                toast('绑定未变更, 无需保存', true);
                return;
            }
            /* 同步先查一下当前值域下有多少条对照, 提示给用户 */
            api('QueryRel', {
                PlatCode: gPlat, DomainCode: gDomain.DomainCode,
                Page: 1, Rows: 1
            }, function(rsRel) {
                var existing = (rsRel && rsRel.total) ? rsRel.total : 0;
                doChangeBindSave(oldDict, newDict, existing, tabIdx, p, cb);
            });
        }
    });
}

function doChangeBindSave(oldDict, newDict, existing, tabIdx, p, cb) {
    /* 先就地新增字典(若用户选了 Tab2), 再保存绑定 */
    function proceed(clearMappingsFlag) {
        if (tabIdx === 0) {
            api('SaveDomainHisDict', {
                PlatCode: gPlat, DomainCode: gDomain.DomainCode,
                HisDictCode: newDict, ClearMappings: clearMappingsFlag
            }, cb);
        } else {
            var mode = (p.newMode || 'S').trim();
            api('SaveHisDict', {
                DictCode: p.newCode, DictName: p.newName, Mode: mode,
                SqlText: (mode === 'S') ? p.newSql : p.newEnum,
                ActiveFlag: 'Y', Memo: p.newMemo
            }, function(rs) {
                if (!rs || !rs.success) { cb(rs || { success: false, msg: '保存新字典失败' }); return; }
                api('SaveDomainHisDict', {
                    PlatCode: gPlat, DomainCode: gDomain.DomainCode,
                    HisDictCode: newDict, ClearMappings: clearMappingsFlag
                }, cb);
            });
        }
    }
    if (!existing) {
        /* 该值域下原本就无对照数据, 直接保存不需确认 */
        proceed('N');
        return;
    }
    /* 弹确认: 切到不同字典 (或解绑) 会清空 X 条对照 */
    var msg = '当前值域已绑定到「' + (oldDict || '（未绑定）') + '」，'
            + '新绑定「' + (newDict || '（解除绑定）') + '」与原绑定不同。\n\n'
            + '将自动清空该值域下所有 ' + existing + ' 条对照关系（Rel / IdxRel），此操作不可撤销。\n\n'
            + '是否继续？';
    if (!window.confirm(msg)) { return; }
    proceed('Y');
}

function toggleBindMode() {
    var mode = val('bdMode') || 'S';
    if (mode === 'S') {
        $('#bdSqlBox').show();
        $('#bdEnumBox').hide();
    } else {
        $('#bdSqlBox').hide();
        $('#bdEnumBox').show();
    }
}

function bindDictLookup() {
    api('QueryHisDict', { Keyword: '', ActiveFlag: 'Y', Page: 1, Rows: 0 }, function(rs) {
        var list = (rs && rs.rows) ? rs.rows : [];
        var opts = '<option value="">（不绑定 · 当前值域将保持未绑定）</option>';
        for (var i = 0; i < list.length; i++) {
            var tag = (list[i].Mode === 'E') ? '枚举' : 'SQL';
            opts += '<option value="' + escQ(list[i].DictCode) + '">[' + tag + '] ' + escHtml(list[i].DictName) + '(' + escHtml(list[i].DictCode) + ')</option>';
        }
        $('#bdDict').html(opts);
        $('#bdDict').val(gDomain.HisDictCode || '');
    });
}

function saveBindNewDict(cb) {
    var mode = val('bdMode') || 'S';
    var code = val('bdNewCode');
    var name = val('bdNewName');
    if (!code) { toast('字典代码不能为空', true); return; }
    if (!name) { toast('字典名称不能为空', true); return; }
    var payload = {
        DictCode: code, DictName: name, Mode: mode,
        SqlText: (mode === 'S') ? val('bdSql') : val('bdEnum'),
        ActiveFlag: 'Y', Memo: val('bdNewMemo')
    };
    if (mode === 'S' && !payload.SqlText) { toast('请填写 SQL 语句', true); return; }
    if (mode === 'E' && !payload.SqlText) { toast('请填写枚举项', true); return; }
    api('SaveHisDict', payload, function(rs) {
        if (rs && rs.success) {
            /* 立即把该字典绑定到当前值域 */
            api('SaveDomainHisDict', {
                PlatCode: gPlat, DomainCode: gDomain.DomainCode, HisDictCode: code
            }, function(rs2) { if (cb) { cb(rs2 || rs); } });
        } else {
            if (cb) { cb(rs); }
        }
    });
}

function afterBindSaved(rs) {
    if (rs && rs.success) {
        toast(rs.msg || '保存成功');
        closeDlg('dlgBind');
        loadDomain(1);
        /* 重新定位到该值域并选中 */
        var rows = [];
        try { rows = $('#dgDomain').datagrid('getRows'); } catch(e) {}
        for (var i = 0; i < rows.length; i++) {
            if (rows[i].DomainCode === gDomain.DomainCode) {
                try { $('#dgDomain').datagrid('selectRow', i); } catch(e2) {}
                break;
            }
        }
        loadDict();
    } else {
        toast((rs && rs.msg) || '保存失败', true);
    }
}

/* ============================== Tab2: 对照关系查询 ============================== */
function loadRel(page) {
    var plat = val('rPlat') || gPlat;
    /* rDomainSel(精确) 优先于 rDomain(自由文本); 二者互斥已在 change/input 时同步 */
    var dom = val('rDomainSel') || val('rDomain');
    api('QueryRel', {
        PlatCode: plat, DomainCode: dom, ItemKeyword: val('rItem'),
        HisKeyword: val('rHis'), ActiveFlag: val('rFlag'), MapMode: val('rMode'),
        Page: page || 1, Rows: gRelSize
    }, function(rs) {
        var total = (rs && rs.total) ? rs.total : 0;
        var rows  = (rs && rs.rows)  ? rs.rows  : [];
        try {
            $('#dgRel').datagrid('loadData', { total: total, rows: rows });
            var pager = $('#dgRel').datagrid('getPager');
            $(pager).pagination({
                total: total, pageNumber: (page || 1), pageSize: gRelSize, pageList: [50, 100, 200]
            });
        } catch(e) {}
        $('#relStat').text('共 ' + total + ' 条对照关系');
    });
}

function resetRel() {
    /* 重置时保留平台选择(否则会出现"换平台后只剩空"的现象) */
    $('#rDomain').val('');
    $('#rDomainSel').val('');
    $('#rItem').val('');
    $('#rHis').val('');
    $('#rFlag').val('');
    $('#rMode').val('');
    /* 同步顶部平台的对照列表, 不再用硬编码 SY */
    if (gPlat) { $('#rPlat').val(gPlat); }
    loadQueryDomainSel();
    loadRel(1);
}

function selectedRelIds() {
    var rows = [];
    try { rows = $('#dgRel').datagrid('getSelections'); } catch(e) {}
    var ids = [];
    for (var i = 0; i < rows.length; i++) {
        if (rows[i].HisCode) {
            ids.push(rows[i].DomainCode + '|' + rows[i].ItemCode + '|' + rows[i].HisCode);
        }
    }
    return ids;
}

function batchFlag(flag) {
    var ids = selectedRelIds();
    if (!ids.length) { toast('请先勾选要操作的记录', true); return; }
    var tip = (flag === 'Y') ? '确定批量启用选中的 ' + ids.length + ' 条对照吗？' : '确定批量停用选中的 ' + ids.length + ' 条对照吗？';
    if (!window.confirm(tip)) { return; }
    api('SetRelFlagBatch', { PlatCode: gPlat, IdList: ids.join('^'), ActiveFlag: flag }, function(rs) {
        if (rs && rs.success) { toast(rs.msg || '操作成功'); loadRel(1); }
        else { toast((rs && rs.msg) || '操作失败', true); }
    });
}

function batchDelete() {
    var ids = selectedRelIds();
    if (!ids.length) { toast('请先勾选要删除的记录', true); return; }
    if (!window.confirm('确定删除选中的 ' + ids.length + ' 条对照关系吗？删除后不可恢复！')) { return; }
    api('DeleteRelBatch', { PlatCode: gPlat, IdList: ids.join('^') }, function(rs) {
        if (rs && rs.success) { toast(rs.msg || '删除成功'); loadRel(1); }
        else { toast((rs && rs.msg) || '删除失败', true); }
    });
}

function exportRel() {
    apiRaw('ExportRel', { PlatCode: gPlat, DomainCode: val('rDomain') }, function(txt) {
        if (!txt) { toast('导出内容为空', true); return; }
        downloadCsv(txt, '字典对照关系_' + gPlat + '_' + fmtNow() + '.csv');
        toast('导出完成');
    });
}

function downloadCsv(text, fileName) {
    try {
        var blob = new Blob(['\ufeff' + text], { type: 'text/csv;charset=utf-8;' });
        if (window.navigator && window.navigator.msSaveBlob) {
            window.navigator.msSaveBlob(blob, fileName);
            return;
        }
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch(e) {
        toast('浏览器不支持文件下载', true);
    }
}

function fmtNow() {
    var d = new Date();
    var p = function(n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + p(d.getHours()) + p(d.getMinutes());
}

/* 修改对照（Tab2 与 Tab1 当前对照共用） */
function openRelEditDlg(row) {
    var html = ''
        + '<div class="dlg-inner">'
        +   '<div class="dl-row"><label>值域</label><input id="reDomain" readonly></div>'
        +   '<div class="dl-row"><label>采集字典条目</label><input id="reItem" readonly></div>'
        +   '<div class="dl-2">'
        +     '<div class="dl-row"><label><span style="color:red">*</span>HIS 代码</label><input id="reCode" readonly></div>'
        +     '<div class="dl-row"><label>HIS 描述</label><input id="reDesc"></div>'
        +   '</div>'
        +   '<div class="dl-2">'
        +     '<div class="dl-row"><label>状态</label><select id="reFlag"><option value="Y">启用</option><option value="N">停用</option></select></div>'
        +     '<div class="dl-row"><label>备注</label><input id="reMemo"></div>'
        +   '</div>'
        +   '<div class="dl-row"><label>创建 / 修改</label><input id="reTrace" readonly></div>'
        + '</div>';
    showDlg('dlgRelEdit', '修改对照关系', html, 560, function() {
        $('#reDomain').val((row.DomainCode || '') + '  ' + (row.DomainName || ''));
        $('#reItem').val((row.ItemCode || '') + '  ' + (row.ItemName || ''));
        $('#reCode').val(row.HisCode || '');
        $('#reDesc').val(row.HisDesc || '');
        $('#reFlag').val(row.ActiveFlag || 'Y');
        $('#reMemo').val(row.Memo || '');
        $('#reTrace').val((row.CreateUser || '') + ' ' + (row.CreateTime || '') + '  /  ' + (row.UpdateUser || '') + ' ' + (row.UpdateTime || ''));
    }, function() {
        api('UpdateRel', {
            PlatCode: row.PlatCode || gPlat, DomainCode: row.DomainCode, ItemCode: row.ItemCode,
            HisCode: row.HisCode, HisDesc: val('reDesc'), ActiveFlag: val('reFlag'), Memo: val('reMemo')
        }, function(rs) {
            if (rs && rs.success) {
                toast('保存成功');
                closeDlg('dlgRelEdit');
                loadRel(1);
                if (gItem) { loadCurRel(); }
            } else {
                toast((rs && rs.msg) || '保存失败', true);
            }
        });
    });
}

/* ============================== Tab3: 平台维护 ============================== */
function loadPlat() {
    api('QueryPlatform', { Keyword: '', ActiveFlag: '', Page: 1, Rows: 100 }, function(rs) {
        var rows = (rs && rs.rows) ? rs.rows : [];
        try { $('#dgPlat').datagrid('loadData', { total: rows.length, rows: rows }); } catch(e) {}
    });
}

function openPlatDlg(mode, row) {
    var html = ''
        + '<div class="dlg-inner">'
        +   '<div class="dl-2">'
        +     '<div class="dl-row"><label><span style="color:red">*</span>平台代码</label><input id="pfCode"></div>'
        +     '<div class="dl-row"><label><span style="color:red">*</span>平台名称</label><input id="pfName"></div>'
        +   '</div>'
        +   '<div class="dl-2">'
        +     '<div class="dl-row"><label>版本</label><input id="pfVer"></div>'
        +     '<div class="dl-row"><label>启用标志</label><select id="pfFlag"><option value="Y">启用</option><option value="N">停用</option></select></div>'
        +   '</div>'
        +   '<div class="dl-row"><label>备注</label><input id="pfMemo"></div>'
        + '</div>';
    showDlg('dlgPlat', (mode === 'add' ? '新增采集平台' : '修改采集平台'), html, 520, function() {
        if (mode === 'add') {
            $('#pfCode').val('').removeAttr('readonly');
            $('#pfName').val('');
            $('#pfVer').val('');
            $('#pfFlag').val('Y');
            $('#pfMemo').val('');
        } else {
            $('#pfCode').val(row.PlatCode).attr('readonly', 'readonly');
            $('#pfName').val(row.PlatName);
            $('#pfVer').val(row.Version);
            $('#pfFlag').val(row.ActiveFlag || 'Y');
            $('#pfMemo').val(row.Memo);
        }
    }, function() {
        api('SavePlatform', {
            PlatCode: val('pfCode'), PlatName: val('pfName'), Version: val('pfVer'),
            ActiveFlag: val('pfFlag'), Memo: val('pfMemo')
        }, function(rs) {
            if (rs && rs.success) {
                toast('保存成功');
                closeDlg('dlgPlat');
                loadPlat();
                loadPlatCombo(function() { resetDomain(); });
            } else {
                toast((rs && rs.msg) || '保存失败', true);
            }
        });
    });
}

function deletePlat(code) {
    if (!window.confirm('删除平台【' + code + '】会连带删除其下全部值域、条目与对照关系，确定继续吗？')) { return; }
    api('DeletePlatform', { PlatCode: code }, function(rs) {
        if (rs && rs.success) { toast('删除成功'); loadPlat(); loadPlatCombo(); }
        else { toast((rs && rs.msg) || '删除失败', true); }
    });
}

/* ============================== Tab3: HIS 字典表注册 ============================== */
function loadDict() {
    api('QueryHisDict', { Keyword: '', ActiveFlag: '', Page: 1, Rows: 200 }, function(rs) {
        var rows = (rs && rs.rows) ? rs.rows : [];
        try { $('#dgDict').datagrid('loadData', { total: rows.length, rows: rows }); } catch(e) {}
    });
}

function openDictDlg(mode, row) {
    var html = ''
        + '<div class="dlg-inner" style="max-height:500px;">'
        +   '<div class="dl-2">'
        +     '<div class="dl-row"><label><span style="color:red">*</span>字典代码</label><input id="dcCode"></div>'
        +     '<div class="dl-row"><label><span style="color:red">*</span>字典名称</label><input id="dcName"></div>'
        +   '</div>'
        +   '<div class="dl-2">'
        +     '<div class="dl-row"><label>取数方式</label>'
        +       '<select id="dcMode"><option value="S">S SQL 查询</option><option value="E">E 枚举</option></select>'
        +     '</div>'
        +     '<div class="dl-row"><label>启用标志</label><select id="dcFlag"><option value="Y">启用</option><option value="N">停用</option></select></div>'
        +   '</div>'
        +   '<div class="dl-row">'
        +     '<label>SQL 语句（<code>mode=S</code> 时填写，结果需含 code / desc 列，可选含 WHERE / TOP n）</label>'
        +     '<textarea id="dcSql" rows="6" style="font-family:Consolas,monospace;" placeholder="例: SELECT CTNAT_Code AS code, CTNAT_Desc AS desc FROM CT_Nation"></textarea>'
        +   '</div>'
        +   '<div class="dl-row">'
        +     '<label>枚举项（<code>mode=E</code> 时填写，每行 <code>代码=名称</code>）</label>'
        +     '<textarea id="dcEnum" rows="6" style="font-family:Consolas,monospace;" placeholder="1=是\n2=否"></textarea>'
        +   '</div>'
        +   '<div class="dl-row"><label>备注</label><input id="dcMemo"></div>'
        + '</div>';
    showDlg('dlgDict', (mode === 'add' ? '新增 HIS 字典表' : '修改 HIS 字典表'), html, 640, function() {
        if (mode === 'add') {
            $('#dcCode').val('').removeAttr('readonly');
            $('#dcName').val('');
            $('#dcMode').val('S');
            $('#dcFlag').val('N');
            $('#dcSql').val('');
            $('#dcEnum').val('');
            $('#dcMemo').val('');
        } else {
            $('#dcCode').val(row.DictCode).attr('readonly', 'readonly');
            $('#dcName').val(row.DictName);
            $('#dcMode').val(row.Mode || 'S');
            $('#dcFlag').val(row.ActiveFlag || 'N');
            /* 后端把 SQL 与枚举统一存到 SqlText 字段；Mode 决定如何解析 */
            $('#dcSql').val((row.Mode === 'E') ? '' : (row.SqlText || ''));
            $('#dcEnum').val((row.Mode === 'E') ? (row.SqlText || '') : '');
            $('#dcMemo').val(row.Memo || '');
        }
    }, function() {
        var mode = val('dcMode') || 'S';
        var sqlText = (mode === 'E') ? val('dcEnum') : val('dcSql');
        if (mode === 'S' && !val('dcSql')) { toast('SQL 方式请填写 SQL 语句', true); return; }
        if (mode === 'E' && !val('dcEnum')) { toast('枚举方式请填写枚举项', true); return; }
        api('SaveHisDict', {
            DictCode: val('dcCode'), DictName: val('dcName'), Mode: mode,
            SqlText: sqlText, ActiveFlag: val('dcFlag'), Memo: val('dcMemo')
        }, function(rs) {
            if (rs && rs.success) {
                toast('保存成功');
                closeDlg('dlgDict');
                loadDict();
            } else {
                toast((rs && rs.msg) || '保存失败', true);
            }
        });
    });
}

function probeDict(code) {
    api('ProbeHisDict', { DictCode: code }, function(rs) {
        var h = '<div class="dlg-inner" style="max-height:380px;">';
        h += '<div style="font-size:13px;color:#555;margin-bottom:8px;">字典【' + escHtml(code) + '】 取数方式=' + escHtml(rs.Mode || '') + '</div>';
        h += '<table class="probe-tbl"><tr><th style="width:90px;">代码</th><th style="width:150px;">描述</th><th>原始节点 / 备注</th></tr>';
        var list = (rs && rs.samples) ? rs.samples : [];
        if (!list.length) {
            h += '<tr><td colspan="3" style="color:#c44;">未取到样本数据，请检查配置</td></tr>';
        }
        for (var i = 0; i < list.length; i++) {
            h += '<tr><td>' + escHtml(list[i].code) + '</td><td>' + escHtml(list[i].desc) + '</td><td>' + escHtml(list[i].raw) + '</td></tr>';
        }
        h += '</table>';
        if (rs && rs.msg) { h += '<div style="font-size:12px;color:#888;margin-top:8px;">' + escHtml(rs.msg) + '</div>'; }
        h += '<div style="font-size:12px;color:#888;margin-top:8px;">请核对「描述」列是否为正确名称；若不正确，修改 SQL 或枚举内容后重新探测。</div>';
        h += '</div>';
        showDlg('dlgProbe', '字典探测结果', h, 720, null, null, [{ text: '关闭', handler: function() { closeDlg('dlgProbe'); } }]);
    });
}

function deleteDict(code) {
    if (!window.confirm('确定删除字典表【' + code + '】吗？\n注：该字典已被值域绑定时不允许删除（需先解除绑定）。')) { return; }
    api('DeleteHisDict', { DictCode: code }, function(rs) {
        if (rs && rs.success) { toast('删除成功'); loadDict(); }
        else { toast((rs && rs.msg) || '删除失败', true); }
    });
}

/* ============================== Tab3: 导入 ============================== */
function setProgress(txt) {
    $('#impProgress').text(txt);
}

function importUpload() {
    var fileInput = document.getElementById('impFile');
    if (!fileInput.files || !fileInput.files.length) { toast('请先选择 CSV 文件', true); return; }
    var f = fileInput.files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        var text = (e.target && e.target.result) ? e.target.result : '';
        if (!text) { toast('文件内容为空', true); return; }
        doImport(text);
    };
    try { reader.readAsText(f, 'UTF-8'); }
    catch(err) { toast('浏览器不支持文件读取', true); }
}

function doImport(text) {
    var lines = text.split(/\r\n|\r|\n/);
    var header = lines[0];
    var batches = [];
    var cur = [header];
    for (var i = 1; i < lines.length; i++) {
        if ($.trim(lines[i]) === '') { continue; }
        cur.push(lines[i]);
        if (cur.length >= 1000) { batches.push(cur.join('\n')); cur = [header]; }
    }
    if (cur.length > 1) { batches.push(cur.join('\n')); }
    if (!batches.length) { toast('未解析到有效数据行', true); return; }
    var clear = document.getElementById('impClear').checked ? 'Y' : 'N';
    runBatches(batches, 0, 0, 0, clear);
}

function runBatches(batches, idx, itemCnt, domCnt, clear) {
    if (idx >= batches.length) {
        setProgress('导入完成：值域 ' + domCnt + ' 个，条目 ' + itemCnt + ' 条');
        toast('导入完成');
        loadPlat();
        loadPlatCombo(function() { resetDomain(); });
        return;
    }
    setProgress('正在导入第 ' + (idx + 1) + '/' + batches.length + ' 批 ...');
    api('ImportDomainCSV', {
        PlatCode: val('impPlat'),
        CsvText: batches[idx],
        ClearFlag: (idx === 0) ? clear : 'N'
    }, function(rs) {
        if (rs && rs.success) {
            runBatches(batches, idx + 1, itemCnt + (rs.item || 0), domCnt + (rs.domain || 0), clear);
        } else {
            setProgress('导入失败：' + ((rs && rs.msg) || '未知错误'));
            toast('导入失败', true);
        }
    });
}

function importServerPath() {
    var p = val('impPath');
    if (!p) { toast('请填写服务器文件路径', true); return; }
    if (!window.confirm('按服务器路径导入到平台【' + val('impPlat') + '】，确定继续吗？')) { return; }
    setProgress('正在导入，请稍候 ...');
    api('ImportDomainFile', {
        PlatCode: val('impPlat'), FilePath: p,
        ClearFlag: document.getElementById('impClear').checked ? 'Y' : 'N'
    }, function(rs) {
        if (rs && rs.success) {
            setProgress(rs.msg || '导入完成');
            toast('导入完成');
            loadPlat();
            loadPlatCombo(function() { resetDomain(); });
        } else {
            setProgress((rs && rs.msg) || '导入失败');
            toast((rs && rs.msg) || '导入失败', true);
        }
    });
}

/* ============================== 通用弹窗 ============================== */
/* 容错: 部分 HISUI 现场没有注入 dialog 插件, 直接 $().dialog(...) 会抛错炸整个 JS
   此处用 dialog 工具函数: 有 $.fn.dialog 走 HISUI; 否则走自绘 HTML 弹窗   */
function hasDialog() {
    return !!(window.jQuery && jQuery.fn && typeof jQuery.fn.dialog === 'function');
}

/* 同样地: 某些 HISUI 现场缺 $.fn.tabs 或它不真正隐藏面板, 都会让所有分页签堆叠.
   这里既支持真正的 tabs, 也提供自绘 tab header + display 切换的回退路径. */
function hasTabs() {
    return !!(window.jQuery && jQuery.fn && typeof jQuery.fn.tabs === 'function');
}

function setupMainTabs(onSelectCb) {
    var $tabs = $('#mainTabs');
    if (!$tabs.length) { return; }
    if ($tabs.attr('data-tabs-init') === '1') { return; }
    var $panels = $tabs.children('div[title]');
    if ($panels.length === 0) { return; }

    var hisuiOk = false;
    try {
        if (hasTabs()) {
            $tabs.tabs({ onSelect: onSelectCb });
            /* 验证: 真实 tabs() 应该把非活动面板 display:none.
               如果 HISUI 加载了 $.fn.tabs 但实际并未生效, 我们要回退. */
            var visCnt = 0;
            $panels.each(function () {
                if (this.style && this.style.display !== 'none') { visCnt++; }
            });
            hisuiOk = (visCnt <= 1);
        }
    } catch (eTabs) {
        if (window.console) { try { console.warn('[sanyidictmap] $.fn.tabs 调用失败, 启用自绘分页签:', eTabs && eTabs.message); } catch (_e0) {} }
        hisuiOk = false;
    }

    if (hisuiOk) {
        $tabs.attr('data-tabs-init', '1');
        return;
    }

    /* ---- 自绘 tab header + 手动 display:none 切换 ---- */
    var $head = $(
        '<div class="mtabs-head" style="display:flex;border-bottom:2px solid #95B8D7;' +
        'background:linear-gradient(to bottom,#EFF5FF,#E0ECFF);user-select:none;">' +
        '</div>');
    $panels.each(function (idx) {
        var $p = $(this);
        var title = $p.attr('title') || ('Tab' + (idx + 1));
        var $t = $(
            '<a class="mtab" data-idx="' + idx + '" href="javascript:void(0)" ' +
            'style="display:inline-block;padding:9px 22px;cursor:pointer;' +
            'border-right:1px solid #ccc;font-size:14px;color:#444;' +
            'text-decoration:none;transition:background .15s;">' + escHtml(title) + '</a>');
        $t.on('click', function () {
            $head.find('.mtab').css({ background: 'transparent', fontWeight: 'normal', color: '#444' });
            $t.css({ background: '#fff', fontWeight: 'bold', color: '#1671d4' });
            $panels.css('display', 'none');
            $p.css('display', 'block');
            if (onSelectCb) { try { onSelectCb(title, idx); } catch (eSel) { /* ignore */ } }
        });
        $head.append($t);
    });
    $tabs.prepend($head);
    $head.find('.mtab').first().trigger('click');
    $tabs.attr('data-tabs-init', '1');
    if (window.console) { try { console.info('[sanyidictmap] 已切换到自绘分页签模式 ($.fn.tabs 不可用或未生效)'); } catch (_e1) {} }
}

/* 自绘 HTML 弹窗(无 HISUI dialog 时的回退路径) */
function _fallbackOpenDlg(id, title, html, width) {
    var $old = $('#' + id);
    if ($old.length && $old.parent().length) { $old.remove(); }
    var w = width || 520;
    var $mask = $('<div class="win-mask-fb" id="' + id + '-mask" style="position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:99998;"></div>');
    var $win = $(
        '<div id="' + id + '" class="win-fb" style="display:none;position:fixed;z-index:99999;' +
        'top:70px;left:50%;width:' + w + 'px;margin-left:-' + (w/2) + 'px;' +
        'background:#fff;border-radius:6px;box-shadow:0 4px 18px rgba(0,0,0,.25);">' +
        '<div class="win-head-fb" style="padding:10px 14px;border-bottom:1px solid #eee;font-weight:600;background:#f7f9fc;border-radius:6px 6px 0 0;">' + escHtml(title || '') + '</div>' +
        '<div class="win-body-fb" style="padding:14px;max-height:60vh;overflow:auto;"></div>' +
        '<div class="win-btns-fb" style="padding:10px 14px;text-align:right;border-top:1px solid #f0f0f4;"></div>' +
        '</div>');
    $mask.appendTo('body');
    $win.appendTo('body');
    $win.find('.win-body-fb').html(html);
    $win.show();
    return $win;
}

/* 关闭 dialog(无论是否 HISUI 都安全) */
function closeDlg(id) {
    try {
        if (hasDialog()) { $('#' + id).dialog('close'); }
        else {
            $('#' + id).hide();
            $('#' + id + '-mask').remove();
        }
    } catch (e) { /* ignore */ }
}

function showDlg(id, title, html, width, onOpen, onSave, buttons) {
    /* 每次重建: 去掉旧的(同样 id)避免重复弹窗 */
    try { closeDlg(id); } catch (e) { /* ignore */ }
    var $dlg;
    if (hasDialog()) {
        $dlg = $('<div id="' + id + '" style="display:none;">' + html + '</div>').appendTo('body');
    } else {
        $dlg = _fallbackOpenDlg(id, title, html, width);
        $dlg.find('.win-body-fb').html(html);
        /* 自绘时也要建按钮 */
        var btnsFb = '';
        var btns = buttons;
        if (!btns) {
            btns = [
                { text: '保存', handler: function() { if (onSave) { onSave(); } } },
                { text: '关闭', handler: function() { closeDlg(id); } }
            ];
        }
        for (var bi = 0; bi < btns.length; bi++) {
            (function (b) {
                btnsFb += '<a class="lb-fb" data-i="' + bi + '" style="display:inline-block;margin-left:8px;padding:5px 14px;border:1px solid #ddd;border-radius:3px;background:#fafbfc;cursor:pointer;">' + escHtml(b.text) + '</a>';
            })(btns[bi]);
        }
        $dlg.find('.win-btns-fb').html(btnsFb);
        $dlg.find('.lb-fb').on('click', function () {
            var i2 = parseInt($(this).attr('data-i'), 10);
            btns[i2].handler();
        });
        if (onOpen) { onOpen(); }
        return;
    }

    var btns2 = buttons;
    if (!btns2) {
        btns2 = [
            { text: '保存', handler: function() { if (onSave) { onSave(); } } },
            { text: '关闭', handler: function() { closeDlg(id); } }
        ];
    }
    try {
        $dlg.dialog({
            title: title, closed: false, modal: true, width: width || 520, top: 70, buttons: btns2
        });
    } catch (e) {
        /* HISUI dialog 调用失败 → 退回自绘路径 */
        closeDlg(id);
        _fallbackOpenDlg(id, title, html, width);
        if (onOpen) { try { onOpen(); } catch(e2) {} }
        return;
    }
    /* onOpen 必须在 dialog() 之后调用, 否则 SHIM / 部分 dialog 会用 $d.html(content)
       重写整个 div 内部 DOM, 把之前写入的 input/select 值清空 */
    if (onOpen) { try { onOpen(); } catch(e3) {} }
}

/* ============================== 初始化 ============================== */
$(function() {
    try { $('#btnQDomain').linkbutton({ iconCls: 'icon-search' }); } catch(e1) {}
    try { $('#btnQRel').linkbutton({ iconCls: 'icon-search' }); } catch(e2) {}
    try { $('#btnSaveRel').linkbutton({ iconCls: 'icon-save' }); } catch(e3) {}
    try { $('#btnExp').linkbutton({ iconCls: 'icon-w-export' }); } catch(e4) {}
    try { $('#btnDel').linkbutton({ iconCls: 'icon-cancel' }); } catch(e5) {}
    try { $('#btnOn').linkbutton({ iconCls: 'icon-ok' }); } catch(e6) {}
    try { $('#btnOff').linkbutton({ iconCls: 'icon-no' }); } catch(e7) {}
    try { $('#btnImpUpload').linkbutton({ iconCls: 'icon-w-import' }); } catch(e8) {}
    try { $('#btnBind').linkbutton({ iconCls: 'icon-bind' }); } catch(e9) {}

    /* ---- 主 Tab: 切换时让对应 datagrid 重新计算 fit 高度 ---- */
    setupMainTabs(function(title, index) {
        /* Tab3 HIS 字典表注册(index=2): 只有 dgDict */
        /* Tab4 字典导入维护(index=3): 只有 dgPlat */
        setTimeout(() => {
            if (index === 2) {
                try { $('#dgDict').datagrid('resize'); } catch(_a) {}
            } else if (index === 3) {
                try { $('#dgPlat').datagrid('resize'); } catch(_b) {}
            }
        }, 30);
    });

    /* ---- 值域表 ---- */
    try {
        $('#dgDomain').datagrid({
            fitColumns: true, singleSelect: true, striped: true, rownumbers: true,
            pagination: true, pageSize: gPageSize, pageList: [20, 50, 100], height: 216,
            onBeforeLoad: function(p) { return false; },
            onSelect: function(i, row) { selectDomain(row); },
            columns: [[
                { field: 'DomainCode',  title: '值域代码', width: 130 },
                { field: 'DomainName',  title: '值域名称', width: 180 },
                { field: 'Chapter',     title: '章节',     width: 90 },
                { field: 'ItemCnt',     title: '条目数',   width: 60, align: 'center' },
                { field: 'MappedCnt',   title: '已对照',   width: 60, align: 'center',
                  formatter: function(v, r) {
                      var pct = (r.ItemCnt > 0) ? Math.round(v * 100 / r.ItemCnt) : 0;
                      return v + ' (' + pct + '%)';
                  }
                },
                { field: 'RelCnt',      title: '对照条数', width: 70, align: 'center' },
                { field: 'HisDictName', title: 'HIS字典绑定', width: 160,
                  formatter: function(v, r) { return bindBadge(r); }
                }
            ]]
        });
        var p1 = $('#dgDomain').datagrid('getPager');
        $(p1).pagination({
            onSelectPage: function(pn, ps) { gPageSize = ps; loadDomain(pn); }
        });
    } catch(e9) {}

    /* ---- 采集条目表 ---- */
    try {
        $('#dgItem').datagrid({
            fitColumns: true, singleSelect: false, striped: true, rownumbers: true,
            pagination: true, pageSize: gPageSize, pageList: [20, 50, 100], height: 280,
            onBeforeLoad: function(p) { return false; },
            onSelect: function(i, row) { selectItem(row); },
            onCheck: function(i, row) { if (row && !gItem) { selectItem(row); } },
            onUnselect: function() { /* 保留 gItem, 不取消 */ },
            rowStyler: function(i, row) { return (row.RelCnt === 0) ? '' : 'font-weight:600;'; },
            columns: [[
                { field: 'ck', title: '', width: 28, checkbox: true },
                { field: 'ItemCode', title: '代码', width: 90 },
                { field: 'ItemName', title: '名称', width: 170 },
                { field: 'RelCnt',   title: '已对照', width: 60, align: 'center',
                  formatter: function(v) { return v > 0 ? '<span style="color:#2a8f2a;font-weight:600;">' + v + '</span>' : '<span style="color:#bbb;">0</span>'; }
                },
                { field: 'RelDescs', title: '当前对照（HIS描述）', width: 240,
                  formatter: function(v, r) { return r.RelCnt > 0 ? escHtml(v) : '<span style="color:#bbb;">未对照</span>'; }
                }
            ]]
        });
        var p2 = $('#dgItem').datagrid('getPager');
        $(p2).pagination({
            onSelectPage: function(pn, ps) { gPageSize = ps; loadItem(pn); }
        });
    } catch(e10) {}

    /* ---- HIS 字典表 ---- */
    try {
        $('#dgHis').datagrid({
            fitColumns: true, singleSelect: false, striped: true, rownumbers: true,
            pagination: true, pageSize: gRelSize, pageList: [50, 100, 200], height: 298,
            idField: 'Code', selectOnCheck: true, checkOnSelect: true,
            onBeforeLoad: function(p) { return false; },
            onLoadSuccess: function(d) { onHisLoadSuccess(d); },
            onSelect: function() { updateSelTip(); },
            onUnselect: function() { updateSelTip(); },
            onSelectAll: function() { updateSelTip(); },
            onUnselectAll: function() { updateSelTip(); },
            columns: [[
                { checkbox: true, width: 30 },
                { field: 'Code', title: 'HIS代码', width: 120 },
                { field: 'Desc', title: 'HIS描述', width: 300 }
            ]]
        });
        var p3 = $('#dgHis').datagrid('getPager');
        $(p3).pagination({
            onSelectPage: function(pn, ps) { gRelSize = ps; loadHis(pn); }
        });
    } catch(e11) {}

    /* ---- 当前对照表 ---- */
    try {
        $('#dgCurRel').datagrid({
            fitColumns: true, singleSelect: true, striped: true, rownumbers: true, height: 140,
            onBeforeLoad: function(p) { return false; },
            columns: [[
                { field: 'HisCode',  title: '对照代码', width: 100 },
                { field: 'HisDesc',  title: '对照描述', width: 170 },
                { field: 'ActiveFlag', title: '状态', width: 55, align: 'center',
                  formatter: function(v) { return flagText(v); }
                },
                { field: 'Memo',     title: '备注', width: 110 },
                { field: 'op', title: '操作', width: 90, align: 'center',
                  formatter: function(v, row) {
                      return '<a href="javascript:void(0)" style="color:#017bce;margin-right:8px;" onclick="editCurRel(\'' + escQ(row.HisCode) + '\')">修改</a>'
                           + '<a href="javascript:void(0)" style="color:#c44;" onclick="deleteCurRel(\'' + escQ(row.HisCode) + '\')">删除</a>';
                  }
                }
            ]]
        });
    } catch(e12) {}

    /* ---- 对照关系查询表 ---- */
    try {
        $('#dgRel').datagrid({
            fitColumns: false, singleSelect: false, striped: true, rownumbers: true,
            pagination: true, pageSize: gRelSize, pageList: [50, 100, 200], height: 470,
            idField: 'HisCode',
            onBeforeLoad: function(p) { return false; },
            rowStyler: function(i, row) { return (row.ActiveFlag === 'N') ? 'color:#999;' : ''; },
            columns: [[
                { checkbox: true, width: 30 },
                { field: 'DomainCode', title: '值域代码', width: 120 },
                { field: 'DomainName', title: '值域名称', width: 160 },
                { field: 'ItemCode',   title: '采集代码', width: 90 },
                { field: 'ItemName',   title: '采集名称', width: 160 },
                { field: 'HisCode',    title: 'HIS代码',  width: 100 },
                { field: 'HisDesc',    title: 'HIS描述',  width: 180 },
                { field: 'ActiveFlag', title: '状态', width: 60, align: 'center',
                  formatter: function(v) { return flagText(v); }
                },
                { field: 'Memo',       title: '备注', width: 120 },
                { field: 'UpdateUser', title: '修改人', width: 70 },
                { field: 'UpdateTime', title: '修改时间', width: 130 },
                { field: 'op', title: '操作', width: 90, align: 'center',
                  formatter: function(v, row) {
                      return '<a href="javascript:void(0)" style="color:#017bce;margin-right:8px;" onclick="editRelRow(\'' + escQ(row.DomainCode) + '\',\'' + escQ(row.ItemCode) + '\',\'' + escQ(row.HisCode) + '\')">修改</a>'
                           + '<a href="javascript:void(0)" style="color:#c44;" onclick="deleteRelRow(\'' + escQ(row.DomainCode) + '\',\'' + escQ(row.ItemCode) + '\',\'' + escQ(row.HisCode) + '\')">删除</a>';
                  }
                }
            ]]
        });
        var p4 = $('#dgRel').datagrid('getPager');
        $(p4).pagination({
            onSelectPage: function(pn, ps) { gRelSize = ps; loadRel(pn); }
        });
    } catch(e13) {}

    /* ---- 平台表 ---- */
    try {
        $('#dgPlat').datagrid({
            fitColumns: true, singleSelect: true, striped: true, rownumbers: true, fit: true,
            onBeforeLoad: function(p) { return false; },
            columns: [[
                { field: 'PlatCode', title: '平台代码', width: 100 },
                { field: 'PlatName', title: '平台名称', width: 200 },
                { field: 'Version',  title: '版本', width: 80 },
                { field: 'DomainCnt', title: '值域数', width: 70, align: 'center' },
                { field: 'ItemCnt',  title: '条目数', width: 80, align: 'center' },
                { field: 'RelCnt',   title: '对照数', width: 80, align: 'center' },
                { field: 'ActiveFlag', title: '状态', width: 60, align: 'center',
                  formatter: function(v) { return flagText(v); }
                },
                { field: 'Memo',     title: '备注', width: 220 },
                { field: 'op', title: '操作', width: 110, align: 'center',
                  formatter: function(v, row) {
                      return '<a href="javascript:void(0)" style="color:#017bce;margin-right:8px;" onclick="openPlatDlg(\'edit\',' + platRowJson(row) + ')">修改</a>'
                           + '<a href="javascript:void(0)" style="color:#c44;" onclick="deletePlat(\'' + escQ(row.PlatCode) + '\')">删除</a>';
                  }
                }
            ]]
        });
    } catch(e14) {}

    /* ---- HIS 字典注册表 ---- */
    try {
        $('#dgDict').datagrid({
            fitColumns: false, singleSelect: true, striped: true, rownumbers: true, fit: true,
            onBeforeLoad: function(p) { return false; },
            rowStyler: function(i, row) { return (row.ActiveFlag === 'N') ? 'color:#999;' : ''; },
            columns: [[
                { field: 'DictCode', title: '字典代码', width: 110 },
                { field: 'DictName', title: '字典名称', width: 150 },
                { field: 'Mode',     title: '方式', width: 60, align: 'center',
                  formatter: function(v) { return v === 'E' ? '<span class="badge-enum">枚举</span>' : '<span class="badge-sql">SQL</span>'; }
                },
                { field: 'SqlText',  title: 'SQL/枚举内容', width: 340,
                  formatter: function(v, r) {
                      var s = v || '';
                      if (s.length > 80) { s = s.substring(0, 80) + ' ...'; }
                      return '<span style="font-family:Consolas,monospace;font-size:12px;color:#555;">' + escHtml(s).replace(/\n/g, ' / ') + '</span>';
                  }
                },
                { field: 'ActiveFlag', title: '状态', width: 60, align: 'center',
                  formatter: function(v) { return flagText(v); }
                },
                { field: 'Memo',     title: '备注', width: 200 },
                { field: 'op', title: '操作', width: 150, align: 'center',
                  formatter: function(v, row) {
                      var h = '<a href="javascript:void(0)" style="color:#017bce;margin-right:8px;" onclick="openDictDlg(\'edit\',' + dictRowJson(row) + ')">修改</a>';
                      h += '<a href="javascript:void(0)" style="color:#fd7201;margin-right:8px;" onclick="probeDict(\'' + escQ(row.DictCode) + '\')">探测</a>';
                      h += '<a href="javascript:void(0)" style="color:#c44;" onclick="deleteDict(\'' + escQ(row.DictCode) + '\')">删除</a>';
                      return h;
                  }
                }
            ]]
        });
    } catch(e15) {}

    /* ---- 事件 ---- */
    $('#gPlat').change(function() {
        gPlat = $(this).val();
        $('#impPlat').val(gPlat);
        $('#rPlat').val(gPlat);
        gDomain = null;
        gItem = null;
        gCurCodes = {};
        resetDomain();
        loadQueryDomainSel();
        loadRel(1);
    });
    /* 查询 Tab 切换平台 → 重新拉值域下拉 */
    $('#rPlat').change(function() {
        gPlat = $(this).val();
        loadQueryDomainSel();
        loadRel(1);
    });
    /* 值域下拉/输入互斥, 任一变化即查 */
    $('#rDomainSel').change(function() { onRDomainSelChange(); loadRel(1); });
    $('#rDomain').on('input keyup change', function() { onRDomainInput(); }).keydown(function(e) { if (e.keyCode === 13) { onRDomainInput(); loadRel(1); } });
    $('#rItem').keydown(function(e) { if (e.keyCode === 13) { loadRel(1); } });
    $('#rHis').keydown(function(e) { if (e.keyCode === 13) { loadRel(1); } });
    $('#qHis').keydown(function(e) { if (e.keyCode === 13) { loadHis(1); } });
    $('#qItem').keydown(function(e) { if (e.keyCode === 13) { loadItem(1); } });
    /* 显示模式切换: 重新载入 HIS 字典 */
    $('#qHisShowMode').on('change', function() {
        if (gDomain && gDomain.HisDictCode) { loadHis(1); }
    });

    /* ---- 首次加载 ---- */
    loadPlatCombo(function() {
        loadDomain(1);
        loadRel(1);
        loadPlat();
        loadDict();
    });
});

/* 行数据转 JSON 字面量（供 onclick 内联传参，IE11 兼容写法） */
function platRowJson(row) {
    return '{PlatCode:"' + escQ(row.PlatCode) + '",PlatName:"' + escQ(row.PlatName) + '",Version:"' + escQ(row.Version)
        + '",ActiveFlag:"' + escQ(row.ActiveFlag) + '",Memo:"' + escQ(row.Memo) + '"}';
}
function dictRowJson(row) {
    return '{DictCode:"' + escQ(row.DictCode) + '",DictName:"' + escQ(row.DictName) + '",Mode:"' + escQ(row.Mode)
        + '",SqlText:"' + escQ(row.SqlText || '') + '",ActiveFlag:"' + escQ(row.ActiveFlag) + '",Memo:"' + escQ(row.Memo || '') + '"}';
}

/* Tab2 行操作 */
function editRelRow(domCode, itemCode, hisCode) {
    var rows = [];
    try { rows = $('#dgRel').datagrid('getRows'); } catch(e) {}
    for (var i = 0; i < rows.length; i++) {
        if (rows[i].DomainCode === domCode && rows[i].ItemCode === itemCode && rows[i].HisCode === hisCode) {
            openRelEditDlg(rows[i]);
            return;
        }
    }
    toast('未找到该对照记录，请刷新后重试', true);
}

function deleteRelRow(domCode, itemCode, hisCode) {
    if (!window.confirm('确定删除对照【' + domCode + ' / ' + itemCode + ' → ' + hisCode + '】吗？')) { return; }
    api('DeleteRel', {
        PlatCode: gPlat, DomainCode: domCode, ItemCode: itemCode, HisCode: hisCode
    }, function(rs) {
        if (rs && rs.success) { toast('删除成功'); loadRel(1); }
        else { toast((rs && rs.msg) || '删除失败', true); }
    });
}

/* ============================== Tab2 扩展: 对照覆盖查询 ============================== */
/* 用途: 按「HIS 字典」反查在指定 (平台, 值域) 下, 该字典所有 HIS 条目的对照覆盖情况
   列: HIS代码 / HIS描述 / 已对照(Y/N) / 平台条目代码 / 平台条目名称 / 映射条目数 */
var gCovFilter = '';        /* ''=全部  'U'=只看未对照  'M'=只看向已对照 */

function loadCovPlat(cb) {
    api('QueryPlatform', { Keyword: '', ActiveFlag: '', Page: 1, Rows: 200 }, function(rs) {
        var rows = (rs && rs.rows) ? rs.rows : [];
        var s = '<option value="">—选择平台—</option>';
        for (var i = 0; i < rows.length; i++) {
            s += '<option value="' + escHtml(rows[i].PlatCode) + '">'
               + escHtml(rows[i].PlatCode) + ' ' + escHtml(rows[i].PlatName || '')
               + '</option>';
        }
        var $sel = $('#covPlat');
        $sel.html(s);
        if (gPlat) { try { $sel.val(gPlat); } catch(e) {} }
        if (cb) cb();
    });
}

function loadCovDomain() {
    var p = val('covPlat');
    var $sel = $('#covDomain');
    $sel.html('<option value="">—全部—</option>');
    if (!p) { return; }
    api('QueryDomain', { PlatCode: p, Keyword: '', MapFlag: '', Page: 1, Rows: 500 }, function(rs) {
        var rows = (rs && rs.rows) ? rs.rows : [];
        var s = '<option value="">—全部—</option>';
        for (var i = 0; i < rows.length; i++) {
            var mh = rows[i].MappedHisDict || '';
            s += '<option value="' + escHtml(rows[i].DomainCode) + '">'
               + escHtml(rows[i].DomainCode) + ' ' + escHtml(rows[i].DomainName || '')
               + (mh ? ' ✓' + escHtml(mh) : '')
               + '</option>';
        }
        $sel.html(s);
    });
}

function loadCovDict() {
    api('QueryHisDict', { Keyword: '', ActiveFlag: '', Page: 1, Rows: 200 }, function(rs) {
        var rows = (rs && rs.rows) ? rs.rows : [];
        var s = '<option value="">—全部—</option>';
        for (var i = 0; i < rows.length; i++) {
            s += '<option value="' + escHtml(rows[i].DictCode) + '">'
               + escHtml(rows[i].DictCode) + ' ' + escHtml(rows[i].DictName || '')
               + (rows[i].Mode === 'E' ? ' [枚举]' : ' [SQL]')
               + '</option>';
        }
        $('#covDict').html(s);
    });
}

function loadCov(page) {
    var plat  = val('covPlat') || gPlat;
    var dom   = val('covDomain');
    var dictC = val('covDict');
    if (!plat)  { toast('请先选择平台', true); $('#covPlat').focus(); return; }
    if (!dictC) { toast('请选择 HIS 字典', true); $('#covDict').focus(); return; }
    api('QueryRelCoverage', {
        PlatCode:   plat,
        DomainCode: dom,
        DictCode:   dictC,
        Filter:     gCovFilter || '',
        Page:       page || 1,
        Rows:       gCovSize
    }, function(rs) {
        var total    = (rs && rs.total)    ? rs.total    : 0;
        var mapped   = (rs && rs.mapped)   ? rs.mapped   : 0;
        var unmapped = (rs && rs.unmapped) ? rs.unmapped : 0;
        var rows     = (rs && rs.rows)     ? rs.rows     : [];
        try {
            $('#dgCov').datagrid('loadData', { total: total, rows: rows });
            var pager = $('#dgCov').datagrid('getPager');
            $(pager).pagination({
                total: total,
                pageNumber: (page || 1),
                pageSize: gCovSize,
                pageList: [50, 100, 200]
            });
        } catch (e) { console.log('dgCov load err:', e.message); }

        /* rowStyler 已在 onLoad 注册, 不必每次重置 */
        try { $('#dgCov').datagrid('getRows'); /* 仅触发 renderGrid */ } catch (e2) {}

        var cov = total > 0 ? ((mapped / total) * 100).toFixed(1) : '0.0';
        var dictName = (rs && rs.dictName) ? ('「' + rs.dictName + '」') : '';
        $('#covStat').html(
            '字典 ' + dictName + ' 共 <b>' + total + '</b> 个 HIS 条目'
            + ' · 已对照 <b style="color:#27ae60;">' + mapped + '</b>'
            + ' · 未对照 <b style="color:#d63031;">' + unmapped + '</b>'
            + ' · 覆盖率 <b>' + cov + '%</b>'
        );
    });
}

function loadCovWithFilter(mf) {
    gCovFilter = mf || '';
    loadCov(1);
}

function resetCov() {
    $('#covDomain').val('');
    $('#covDict').val('');
    gCovFilter = '';
    if (gPlat) { try { $('#covPlat').val(gPlat); } catch(e) {} }
    loadCovDomain();
    /* 重置后保留下拉状态, 让用户自己点"查询"; 不自动查 */
    $('#covStat').text('请选择 HIS 字典并点击查询');
}

/* 初始化 dgCov 列(在 onLoad 末尾或 CSP 上也能直绑定, 这里做兜底)
   当页面刚启动时 dgCov 元素已存在, 但 datagrid 的列定义由 CSP 标签内的 data-options 指定
   我们在这里再覆盖一次, 保证列定义生效 */
$(function () {
    try {
        $('#dgCov').datagrid({
            title: '',
            columns: [[
                { field: 'HisCode',    title: 'HIS 代码',     width: 110, align: 'left' },
                { field: 'HisDesc',    title: 'HIS 描述',     width: 200, align: 'left' },
                { field: 'MappedFlag', title: '对照状态',     width: 80,  align: 'center',
                    formatter: function(v) {
                        return (v === 'Y')
                            ? '<span style="color:#27ae60;font-weight:600;">已对照</span>'
                            : '<span style="color:#d63031;font-weight:600;">未对照</span>';
                    }
                },
                { field: 'ItemCode',   title: '已对照到平台条目', width: 220, align: 'left' },
                { field: 'ItemName',   title: '平台条目名',     width: 220, align: 'left' },
                { field: 'ItemCount',  title: '条目数',         width: 70,  align: 'center' }
            ]],
            pagination: true,
            rownumbers: true,
            singleSelect: true,
            fitColumns: true,
            striped: true,
            rowStyler: function(idx, row) {
                if (row && row.MappedFlag === 'N') { return 'cov-unmapped'; }
                return '';
            }
        });
    } catch (e) { /* CSP 已声明, 忽略 */ }

    /* Tab2 平台/值域/HIS 字典下拉的初始化 */
    loadCovPlat(function() { loadCovDomain(); loadCovDict(); });
});
