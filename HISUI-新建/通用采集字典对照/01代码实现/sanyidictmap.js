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
var gRelSize   = 20;      // HIS字典块/Tab2 每页条数
var gCovSize   = 20;      // Tab3 覆盖查询每页条数
var gHisPage   = 1;
var gItemPage  = 1;
var gCurRelPage = 1;       // 当前对照表页码
var gDomainSize = 20;      // 值域块每页条数(独立)
var gItemSize   = 20;      // 采集条目块每页条数(独立)
var gCurRelSize = 20;      // 当前对照块每页条数(独立)

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
function bindBadge(row) {
    if (!row || !row.HisDictCode) {
        return '<span style="color:#c44;">未绑定HIS字典</span>';
    }
    return '<span style="color:#2a8f2a;">已绑定 · ' + escHtml(row.HisDictName || row.HisDictCode) + '(' + escHtml(row.HisDictCode) + ')</span>';
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
/* 通用分页条(成熟方案): 块底部固定一行, 左"共N条", 右"上一页/页码/下一页/每页条数",
   翻页完全由页面逻辑驱动, 与 fork 分页组件解耦。onPage(page, size): size 变化时 page 传 1 */
function renderMyPager(pid, total, page, pageSize, onPage) {
    var $p = $('#' + pid);
    if (!$p.length) { return; }
    total = total || 0;
    page = page || 1;
    pageSize = pageSize || 20;
    var pages = Math.max(1, Math.ceil(total / pageSize));
    if (page < 1) { page = 1; }
    if (page > pages) { page = pages; }
    var sizes = [10, 20, 50, 100];
    var opts = '';
    for (var s = 0; s < sizes.length; s++) {
        opts += '<option value="' + sizes[s] + '"' + (sizes[s] === pageSize ? ' selected' : '') + '>' + sizes[s] + '</option>';
    }
    $p.html(
        '<span class="mp-left">共 <b>' + total + '</b> 条</span>'
        + '<span class="mp-right">'
        + '<a href="javascript:void(0)" class="mp-prev' + (page <= 1 ? ' mp-disabled' : '') + '">上一页</a>'
        + '<span class="mp-info">' + page + '/' + pages + '</span>'
        + '<a href="javascript:void(0)" class="mp-next' + (page >= pages ? ' mp-disabled' : '') + '">下一页</a>'
        + '<select class="mp-size">' + opts + '</select>'
        + '<span class="mp-info">条/页</span>'
        + '</span>');
    $p.find('.mp-prev').off('click').on('click', function () { onPage(page - 1, pageSize); });
    $p.find('.mp-next').off('click').on('click', function () { onPage(page + 1, pageSize); });
    $p.find('.mp-size').off('change').on('change', function () {
        onPage(1, parseInt(this.value, 10) || 20);
    });
}

function loadDomain(page) {
    api('QueryDomain', {
        PlatCode: gPlat, Keyword: val('qDomain'), MapFlag: val('qMapFlag'),
        Page: page || 1, Rows: gDomainSize
    }, function(rs) {
        var total = (rs && rs.total) ? rs.total : 0;
        var rows  = (rs && rs.rows)  ? rs.rows  : [];
        try {
            $('#dgDomain').datagrid('loadData', { total: total, rows: rows });
        } catch(e) {}
        renderMyPager('pagerDomain', total, page || 1, gDomainSize, function(p, ps) {
            if (ps) { gDomainSize = ps; }
            loadDomain(p || 1);
        });
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
    $('#itemTip').text(row ? ('  值域：' + row.DomainCode + ' ' + row.DomainName) : '');
    try { $('#dgItem').datagrid('loadData', { total: 0, rows: [] }); } catch(e1) {}
    try { $('#dgCurRel').datagrid('loadData', { total: 0, rows: [] }); } catch(e2) {}
    try { $('#dgHis').datagrid('loadData', { total: 0, rows: [] }); } catch(e3) {}
    renderMyPager('pagerItem', 0, 1, gItemSize, function(p, ps) { if (ps) { gItemSize = ps; } loadItem(p || 1); });
    renderMyPager('pagerCurRel', 0, 1, gCurRelSize, function(p, ps) { if (ps) { gCurRelSize = ps; } loadCurRel(p || 1); });
    renderMyPager('pagerHis', 0, 1, gRelSize, function(p, ps) { if (ps) { gRelSize = ps; } loadHis(p || 1); });
    $('#curRelTip').text('');
    applyMapMode();
    if (row) {
        /* 已绑定字典时同步重置右侧显示模式为默认「仅未对照」 */
        if (row.HisDictCode) {
            try { $('#qHisShowMode').val('N'); } catch(_z) {}
        }
        /* 选中采集字典(值域)即自动查询加载其条目列表, 与是否绑定 HIS 字典无关 */
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
        Page: gItemPage, Rows: gItemSize
    }, function(rs) {
        var total = (rs && rs.total) ? rs.total : 0;
        var rows  = (rs && rs.rows)  ? rs.rows  : [];
        try {
            $('#dgItem').datagrid('loadData', { total: total, rows: rows });
        } catch(e) {}
        renderMyPager('pagerItem', total, gItemPage, gItemSize, function(p, ps) {
            if (ps) { gItemSize = ps; }
            loadItem(p || 1);
        });
    });
}

function selectItem(row) {
    gItem = row;
    if (!row) { return; }
    loadCurRel(function() {
        if (gDomain && gDomain.HisDictCode) { loadHis(1); }
    });
}

/* 当前条目的对照关系(分页) */
function loadCurRel(page, cb) {
    if (typeof page === 'function') { cb = page; page = 1; }
    if (!gItem) { if (cb) { cb(); } return; }
    gCurRelPage = page || 1;
    api('QueryItemRel', {
        PlatCode: gPlat, DomainCode: gDomain.DomainCode, ItemCode: gItem.ItemCode,
        Page: gCurRelPage, Rows: gCurRelSize
    }, function(rs) {
        var total = (rs && rs.total) ? rs.total : 0;
        var rows  = (rs && rs.rows)  ? rs.rows  : [];
        gCurCodes = {};
        for (var i = 0; i < rows.length; i++) { gCurCodes[rows[i].HisCode] = 1; }
        try {
            $('#dgCurRel').datagrid('loadData', { total: total, rows: rows });
        } catch(e) {}
        renderMyPager('pagerCurRel', total, gCurRelPage, gCurRelSize, function(p, ps) {
            if (ps) { gCurRelSize = ps; }
            loadCurRel(p || 1);
        });
        $('#curRelTip').text('  条目：' + gItem.ItemCode + ' ' + (gItem.ItemName || '') + '，共 ' + total + ' 条对照');
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
        try {
            $('#dgHis').datagrid('loadData', { total: total, rows: rows });
        } catch(e) {}
        renderMyPager('pagerHis', total, gHisPage, gRelSize, function(p, ps) {
            if (ps) { gRelSize = ps; }
            loadHis(p || 1);
        });
        /* 下方按钮条(linkbutton)渲染后 hisDictBox 高度会再变化, 网格 fit 需重算一次,
           否则最后一行会被 paneBody 裁掉一部分; 仅加载后单次 resize(非轮询), 无棘轮风险 */
        try { $('#dgHis').datagrid('resize'); } catch(eR1) {}
        setTimeout(function () { try { $('#dgHis').datagrid('resize'); } catch(eR2) {} }, 250);
        /* 每次加载后清空上一轮的勾选(真实 easyui loadData 不重置选择, 会残留) */
        clearDgHisSel();
        /* 方案1: 预勾"当前条目已对照"的行(可再取消), 便于追加/去除维护 */
        try {
            for (var ci = 0; ci < rows.length; ci++) {
                if (rows[ci] && gCurCodes && gCurCodes[String(rows[ci].Code || '')]) {
                    $('#dgHis').datagrid('checkRow', ci);
                }
            }
            updateSelTip();
        } catch (eChk) { /* ignore */ }
        if (rs && rs.success === false && rs.msg) { toast(rs.msg, true); }
    });
}

/* 行判定辅助(方案1): 当前条目已对照=可勾选预勾; 其它条目占用=锁定浅绿 */
function hisRowIsCur(row) {
    return !!(row && gCurCodes && gCurCodes[String(row.Code || '')]);
}
function hisRowIsOther(row) {
    var isMap = !!(row && (row.isMapped === 1 || row.isMapped === '1'));
    return isMap && !hisRowIsCur(row);
}

/* 全选(真实 easyui 表头)后: 撤销"其它条目占用"行的勾选 */
function covHealAllChecked() {
    try {
        var rows = $('#dgHis').datagrid('getRows') || [];
        for (var i = 0; i < rows.length; i++) {
            if (hisRowIsOther(rows[i])) { $('#dgHis').datagrid('uncheckRow', i); }
        }
    } catch (e) { /* ignore */ }
    updateSelTip();
}

/* 载入后禁用占用行复选框 DOM(真实 easyui) */
function lockHisRowBoxes() {
    try {
        var rows = $('#dgHis').datagrid('getRows') || [];
        var $trs = $('#dgHis').datagrid('getPanel').find('.datagrid-btable tr[datagrid-row-index]');
        $trs.each(function () {
            var idx = parseInt($(this).attr('datagrid-row-index'), 10);
            if (isNaN(idx)) { return; }
            var row = rows[idx];
            if (hisRowIsOther(row)) {
                $(this).find('input[type=checkbox]').prop('disabled', true)
                    .attr('title', '已被其他采集条目对照, 不能重复对照');
            }
        });
    } catch (e) { /* ignore */ }
}

/* 载入后标记已对照的行: 其它条目占用的行锁定(不可选/浅绿); 当前条目已对照的留给预勾处理 */
function onHisLoadSuccess(data) {
    var rows = (data && data.rows) ? data.rows : [];
    for (var i = 0; i < rows.length; i++) {
        var code = String(rows[i].Code || '');
        var isMapped = rows[i].isMapped === 1 || rows[i].isMapped === '1';
        if (isMapped) {
            if (gCurCodes && gCurCodes[code]) {
                rows[i].__curMapped = true;   /* 当前条目已对照: 允许勾选/取消 */
            } else {
                rows[i].__relHit = true;      /* 其它条目占用: 锁定(复选框禁用由 lockHisRowBoxes 处理) */
            }
        }
    }
    try { lockHisRowBoxes(); } catch (eL) { /* ignore */ }
    updateSelTip();
}

function updateSelTip() {
    var n = 0;
    try { n = $('#dgHis').datagrid('getSelections').length; } catch(e) {}
    $('#selTip').text('已选 ' + n + ' 项');
}

/* 每次重新载入 HIS 字典列表后清空勾选, 避免上一条目残留影响下一条目对照 */
function clearDgHisSel() {
    try { $('#dgHis').datagrid('uncheckAll'); } catch(e1) {}
    try { $('#dgHis').datagrid('clearSelections'); } catch(e2) {}
    try { updateSelTip(); } catch(e3) {}
}

function saveDictRel() {
    if (!gItem) { toast('请先在左侧选择采集字典条目', true); return; }
    if (!gDomain || !gDomain.HisDictCode) { toast('当前值域未绑定HIS字典，请先维护', true); return; }
    var sels = [];
    try { sels = $('#dgHis').datagrid('getSelections'); } catch(e) {}
    var codes = [];
    for (var i = 0; i < sels.length; i++) { codes.push(sels[i].Code); }
    if (!codes.length) {
        toast('未勾选任何 HIS 代码。如需清空该条目的全部对照，请点【清空对照】', true);
        return;
    }
    /* 保存=追加合并: 只新增/更新本次勾选的码, 不清空老对照(删除走【清空对照】/逐条删除) */
    api('SaveDictRel', {
        PlatCode: gPlat, DomainCode: gDomain.DomainCode, ItemCode: gItem.ItemCode,
        HisCodes: codes.join('^'), Mode: 'A'
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
        +         '<label>SQL 语句（结果需含三列且顺序固定：id 隐藏主键放最前 / code 代码 / desc 描述；可含 WHERE / TOP n）</label>'
        +         '<textarea id="bdSql" rows="6" style="font-family:Consolas,monospace;" placeholder="例: SELECT CTLOC_RowID AS id, CTLOC_Code AS code, CTLOC_Desc AS desc FROM CT_Loc"></textarea>'
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
    if (!gridBuilt('dgRel')) { return; }   /* dgRel 延迟初始化: 首次切到 Tab2 时由 ensureRelGrid 建表后再加载 */
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
                total: total, pageNumber: (page || 1), pageSize: gRelSize, pageList: [20, 50, 100, 200]
            });
        } catch(e) {
            if (window.console) { try { console.error('[sanyidictmap] dgRel loadData 失败:', e && e.message); } catch(_e) {} }
        }
        $('#relStat').text('共 ' + total + ' 条对照关系');
        try { refillGridLayersMulti('dgRel'); } catch (eR) {}
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
    if (!gridBuilt('dgPlat')) { return; }   /* dgPlat 延迟初始化: 首次切到 Tab5 时由 ensurePlatGrid 建表后再加载 */
    api('QueryPlatform', { Keyword: '', ActiveFlag: '', Page: 1, Rows: 100 }, function(rs) {
        var rows = (rs && rs.rows) ? rs.rows : [];
        try {
            $('#dgPlat').datagrid('loadData', { total: rows.length, rows: rows });
            refillGridLayersMulti('dgPlat');
        } catch(e) {
            if (window.console) { try { console.error('[sanyidictmap] dgPlat loadData 失败:', e); } catch(_e) {} }
        }
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
    if (!gridBuilt('dgDict')) { return; }   /* dgDict 延迟初始化: 首次切到 Tab4 时由 ensureDictGrid 建表后再加载 */
    api('QueryHisDict', { Keyword: '', ActiveFlag: '', Page: 1, Rows: 200 }, function(rs) {
        var rows = (rs && rs.rows) ? rs.rows : [];
        try {
            $('#dgDict').datagrid('loadData', { total: rows.length, rows: rows });
            refillGridLayersMulti('dgDict');
        } catch(e) {
            if (window.console) { try { console.error('[sanyidictmap] dgDict loadData 失败:', e); } catch(_e) {} }
        }
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
        +     '<label>SQL 语句（<code>mode=S</code> 时填写，结果需含三列且顺序固定：id 放最前 / code / desc；可含 WHERE / TOP n）</label>'
        +     '<textarea id="dcSql" rows="6" style="font-family:Consolas,monospace;" placeholder="例: SELECT CTLOC_RowID AS id, CTLOC_Code AS code, CTLOC_Desc AS desc FROM CT_Loc"></textarea>'
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
            $('#dcFlag').val('Y');   /* 新增默认启用, 否则注册后无法在绑定列表(仅启用)中出现 */
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

/* ============================== Tab4: 上传导入(参照 基数药维护 导入模式) ==============================
   策略: 字节级读取 → UTF-8 解析, 表头不识别时尝试 GBK → 字符级 CSV 解析(引号感知/去BOM)
   → 转 JSON 行数组 → 每 ≤3000 行一片, 调 CLS ImportDomainRows(单参数 JSON, 无裸换行) 逐行入库 */
function setProgress(txt) {
    $('#impProgress').text(txt);
}

/* UTF-8 字节解码(手写, IE11 兼容) */
function utf8Decode(bytes) {
    var out = '', i = 0, len = bytes.length;
    while (i < len) {
        var b = bytes[i];
        if (b < 0x80) { out += String.fromCharCode(b); i++; }
        else if ((b >> 5) === 0x6) { out += String.fromCharCode(((b & 0x1F) << 6) | (bytes[i + 1] & 0x3F)); i += 2; }
        else if ((b >> 4) === 0xE) { out += String.fromCharCode(((b & 0x0F) << 12) | ((bytes[i + 1] & 0x3F) << 6) | (bytes[i + 2] & 0x3F)); i += 3; }
        else if ((b >> 3) === 0x1E) {
            var cp = ((b & 0x07) << 18) | ((bytes[i + 1] & 0x3F) << 12) | ((bytes[i + 2] & 0x3F) << 6) | (bytes[i + 3] & 0x3F);
            cp -= 0x10000;
            out += String.fromCharCode(0xD800 + (cp >> 10), 0xDC00 + (cp & 0x3FF));
            i += 4;
        } else { out += String.fromCharCode(b); i++; }
    }
    return out;
}

/* GBK 解码(现代浏览器 TextDecoder, 不可用时返回 null) */
function gbkDecode(bytes) {
    try {
        if (typeof TextDecoder !== 'undefined') { return new TextDecoder('gbk').decode(bytes); }
    } catch (e) {}
    return null;
}

/* 字符级 CSV 解析: 支持引号内逗号/换行, 自动去 UTF-8 BOM; 分隔符按表头行逗号/Tab 数量自动识别 */
function parseCsvText(text) {
    var rows = [], row = [], cur = '', inQ = false, i = 0, n = text.length;
    if (text.charCodeAt(0) === 0xFEFF) { i = 1; }
    var headEnd = text.indexOf('\n');
    if (headEnd < 0) { headEnd = n; }
    var headSeg = text.substring(i, headEnd);
    var delim = (headSeg.split('\t').length - 1) > (headSeg.split(',').length - 1) ? '\t' : ',';
    while (i < n) {
        var ch = text.charAt(i);
        if (inQ) {
            if (ch === '"') {
                if (text.charAt(i + 1) === '"') { cur += '"'; i += 2; continue; }
                inQ = false; i++; continue;
            }
            cur += ch; i++; continue;
        }
        if (ch === '"') { inQ = true; i++; continue; }
        if (ch === delim) { row.push(cur); cur = ''; i++; continue; }
        if (ch === '\r') { i++; continue; }
        if (ch === '\n') { row.push(cur); cur = ''; rows.push(row); row = []; i++; continue; }
        cur += ch; i++;
    }
    if (cur !== '' || row.length > 0) { row.push(cur); rows.push(row); }
    return rows;
}

/* 二维数组 → 导入行对象(列: 值域代码,值域名称,代码,名称,说明); 第1列空行跳过 */
function rowsToImport(rows) {
    var out = [];
    if (!rows || rows.length < 2) { return out; }
    for (var r = 1; r < rows.length; r++) {
        var c = rows[r];
        var domCode = String(c[0] == null ? '' : c[0]).replace(/^\ufeff/, '').trim();
        if (domCode === '') { continue; }
        out.push({
            domCode: domCode,
            domName: String(c[1] == null ? '' : c[1]).trim(),
            itemCode: String(c[2] == null ? '' : c[2]).trim(),
            itemName: String(c[3] == null ? '' : c[3]).trim(),
            memo: String(c[4] == null ? '' : c[4]).trim()
        });
    }
    return out;
}

function importUpload() {
    var fileInput = document.getElementById('impFile');
    if (!fileInput.files || !fileInput.files.length) { toast('请先选择 CSV 文件', true); return; }
    var f = fileInput.files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        var bytes = new Uint8Array(e.target.result);
        /* ① 原生 UTF-8 解析 */
        var rows = parseCsvText(utf8Decode(bytes));
        var items = rowsToImport(rows);
        /* ② 第1行非"值域代码"(编码错乱/GBK文件) → 尝试 GBK 再解 */
        if (!items.length && rows.length > 1) {
            var gbk = gbkDecode(bytes);
            if (gbk) { items = rowsToImport(parseCsvText(gbk)); }
        }
        if (!items.length) {
            var hint = '未解析到有效数据行。请确认首行为表头: 值域代码,值域名称,代码,名称,说明';
            if (rows.length > 1) { hint += '（已读 ' + (rows.length - 1) + ' 行, 但首列非值域代码, 可能是编码问题）'; }
            toast(hint, true);
            return;
        }
        var clear = document.getElementById('impClear').checked ? 'Y' : 'N';
        setProgress('解析完成: 共 ' + items.length + ' 行, 开始分批导入 ...');
        runImportChunks(items, clear);
    };
    try { reader.readAsArrayBuffer(f); }
    catch (err) { toast('浏览器不支持文件读取', true); }
}

/* 行数组按 ≤3000 一片切成 JSON 字符串, 逐片提交 */
function runImportChunks(items, clear) {
    var CH = 3000, chunks = [], i = 0;
    while (i < items.length) {
        chunks.push(JSON.stringify(items.slice(i, i + CH)));
        i += CH;
    }
    sendImportChunk(chunks, 0, 0, 0, clear);
}

function sendImportChunk(chunks, idx, itemCnt, domCnt, clear) {
    if (idx >= chunks.length) {
        setProgress('导入完成：值域 ' + domCnt + ' 个，条目 ' + itemCnt + ' 条');
        toast('导入完成');
        loadPlat();
        loadPlatCombo(function() { resetDomain(); });
        return;
    }
    setProgress('正在导入第 ' + (idx + 1) + '/' + chunks.length + ' 批(每批≤3000行) ...');
    api('ImportDomainRows', {
        PlatCode: val('impPlat'),
        JsonText: chunks[idx],
        ClearFlag: (idx === 0) ? clear : 'N'
    }, function(rs) {
        if (rs && rs.success) {
            sendImportChunk(chunks, idx + 1, itemCnt + (rs.item || 0), domCnt + (rs.domain || 0), clear);
        } else {
            setProgress('导入失败：' + ((rs && rs.msg) || '未知错误'));
            toast((rs && rs.msg) || '导入失败', true);
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

    /* ---- 自绘 tab header + 手动 display:none 切换 (观感由 CSP .mtabs-head/.mtab/.mtab.on 控制) ---- */
    var $head = $('<div class="mtabs-head"></div>');
    $panels.each(function (idx) {
        var $p = $(this);
        var title = $p.attr('title') || ('Tab' + (idx + 1));
        var $t = $('<a class="mtab" data-idx="' + idx + '" href="javascript:void(0)">' + escHtml(title) + '</a>');
        $t.on('click', function () {
            $head.find('.mtab').removeClass('on');
            $t.addClass('on');
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

/* 自绘 HTML 弹窗(无 HISUI dialog 时的回退路径) — 经典 HISUI 蓝条窗, 观感由 CSP .win-* 控制 */
function _fallbackOpenDlg(id, title, html, width) {
    var $old = $('#' + id);
    if ($old.length && $old.parent().length) { $old.remove(); }
    var w = width || 520;
    var $mask = $('<div class="win-mask-fb" id="' + id + '-mask" style="position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:99998;"></div>');
    var $win = $(
        '<div id="' + id + '" class="win-fb" style="display:none;position:fixed;z-index:99999;' +
        'top:70px;left:50%;width:' + w + 'px;margin-left:-' + (w / 2) + 'px;">' +
        '<div class="win-head-fb">' +
        '<span>' + escHtml(title || '') + '</span>' +
        '<span class="win-close-fb" title="关闭">×</span>' +
        '</div>' +
        '<div class="win-body-fb" style="max-height:60vh;overflow:auto;"></div>' +
        '<div class="win-btns-fb"></div>' +
        '</div>');
    $mask.appendTo('body');
    $win.appendTo('body');
    $win.find('.win-body-fb').html(html);
    $win.find('.win-close-fb').on('click', function () { closeDlg(id); });
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
        $('#' + id).remove();   /* 去掉旧实例, 避免同 id 残留(close 仅隐藏) */
        $dlg = $('<div id="' + id + '" style="display:none;"></div>').appendTo('body');
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
                btnsFb += '<a class="lb-fb" data-i="' + bi + '" href="javascript:void(0)">' + escHtml(b.text) + '</a>';
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
    var dlgOk = false;
    try {
        $dlg.dialog({
            title: title, closed: false, modal: true, width: width || 520, top: 70, buttons: btns2
        });
        dlgOk = true;
    } catch (e) {
        dlgOk = false;
    }
    if (!dlgOk) {
        /* HISUI dialog 调用失败 → 退回自绘路径 */
        closeDlg(id);
        _fallbackOpenDlg(id, title, html, width);
        if (onOpen) { try { onOpen(); } catch(e2) {} }
        return;
    }
    /* HISUI 真实 dialog: 部分实现不会保留初始化前的 innerHTML,
       把表单内容插到面板体最前(保留 HISUI 已渲染的按钮条等既有子节点) */
    try {
        var $win2 = $dlg.closest('.panel-window');
        var $pb2 = ($win2 && $win2.length) ? $win2.find('.window-body, .panel-body').first() : $();
        if (!$pb2 || !$pb2.length) { $pb2 = $dlg; }
        if ($pb2 && $pb2.length) {
            $pb2.prepend('<div class="dlg-form">' + html + '</div>');
        }
    } catch (eI) { /* ignore */ }
    /* onOpen 必须在 dialog() 与内容注入之后调用, 此时表单控件才存在 */
    if (onOpen) { try { onOpen(); } catch(e3) {} }
}

/* ============================== 统一布局(高度棘轮根治) ==============================
   所有容器/网格高度只在"页面加载 / 窗口尺寸变化(防抖后)"两个时机, 用一次性测量值计算并套用;
   400ms 轮询只做网格 DOM 补高, 不再测量容器 offsetTop —— 从结构上消除
   "测量→写高→fork 重排→下次测得更小"的循环反馈(表现为 tab1/2/3 显示区域变矮、tab4/5 变高)。 */
function applyLayout() {
    try {
        var mt = document.getElementById('mainTabs');
        if (!mt) { return; }

        /* 1. mainTabs 高度: 仅由窗口高/标题条高决定, 与其他 DOM 无反馈关系 */
        var tb = document.getElementById('titleBar');
        var tbH = (tb && tb.offsetHeight) ? tb.offsetHeight : 48;
        var winH = window.innerHeight || document.documentElement.clientHeight || 900;
        var mtH = winH - tbH - 18;   /* 上下外边距合计约 18px */
        if (mtH < 480) { mtH = 480; }
        mt.style.height = mtH + 'px';

        /* 2. 一次性测量(仅此刻): 页签头条高、当前可见容器内容顶、面板可用下边界 */
        var headerH = 32;
        try {
            var hdrs = mt.querySelectorAll('.tabs-header, [class*="tabs-header"]');
            for (var i = 0; i < hdrs.length; i++) {
                if (hdrs[i].offsetHeight > 0) { headerH = hdrs[i].offsetHeight; break; }
            }
        } catch (eH) {}
        var bottom = $(mt).offset().top + $(mt).height() - 12;
        var vis = $(['.tab1grow', '.tabWrap.tabFill', '.tabWrap.fillFull'].join(',')).filter(':visible').first();
        var panelTop = (vis.length)
            ? vis.offset().top
            : ($(mt).offset().top + headerH + 10);

        /* 3. 面板本体高度也一并定住(纯 DOM, 防 fork 面板与内容互相拉扯) */
        var panelH = mtH - headerH;
        if (panelH > 300) {
            try {
                var pels = mt.querySelectorAll('.tabs-panel, [class*="tabs-panel"]');
                for (var p = 0; p < pels.length; p++) {
                    if (Math.abs(panelH - (pels[p].offsetHeight || 0)) > 2) { pels[p].style.height = panelH + 'px'; }
                }
            } catch (eP) {}
        }

        /* 4. 各页签内容容器(含隐藏态)套用同一次算出的高度 */
        var growH = Math.floor(bottom - panelTop - 20);   /* tab1grow/tabFill: content-box, 上下 padding 20 */
        var fillH = Math.floor(bottom - panelTop);        /* fillFull: border-box, 含 padding */
        if (growH < 300) { return; }
        var els = document.querySelectorAll('.tab1grow, .tabWrap.tabFill');
        for (var k = 0; k < els.length; k++) {
            if (Math.abs(growH - (els[k].offsetHeight || 0)) > 2) { els[k].style.height = growH + 'px'; }
        }
        var fels = document.querySelectorAll('.tabWrap.fillFull');
        for (var f = 0; f < fels.length; f++) {
            if (Math.abs(fillH - (fels[f].offsetHeight || 0)) > 2) { fels[f].style.height = fillH + 'px'; }
        }

        /* 5. 网格纯 DOM 补高(含 Tab1 四块) */
        fitTab1Grids();
        var refillIds = ['dgRel', 'dgCov', 'dgDict', 'dgPlat'];
        for (var ri = 0; ri < refillIds.length; ri++) {
            try { refillGridLayers(refillIds[ri]); } catch (eR) {}
        }
    } catch (e) { /* ignore */ }
}

/* 空数据/数据少时, 现场 fork 会把网格压缩到内容高度(表头与分页条贴在一起, 下方大面积空白)。
   探针确认 fork 结构: 原 table 是隐藏占位, 可见表体在 .datagrid-view1/.datagrid-view2 下的
   .datagrid-body 里。因此按类名直接补可见 body 层: 视图层铺满, body = 视图高 - 表头高。
   不调用任何插件方法; 空数据时 body 为空白滚动区, 分页条贴住面板底部。 */
function refillGridLayers(id) {
    try {
        var t = document.getElementById(id);
        if (!t) { return; }
        /* 基准容器: 优先 .grow(Tab2/3/4/5), 无则用 .paneBody(Tab1 四块) */
        var host = null, el = t.parentNode;
        while (el && el !== document.body && el !== document.documentElement) {
            var cls = (el.className || '') + '';
            if (cls.indexOf('grow') >= 0) { host = el; break; }
            if (!host && cls.indexOf('paneBody') >= 0) { host = el; }
            el = el.parentNode;
        }
        if (!host || host.offsetHeight < 60) { return; }
        var hostH = host.offsetHeight;

        /* 沿原表格祖先链找到外层 .datagrid-wrap(网格容器) */
        var wrap = null;
        el = t.parentNode;
        while (el && el !== host && el !== document.body) {
            var c2 = (el.className || '') + '';
            if (c2.indexOf('datagrid-wrap') >= 0) { wrap = el; }
            el = el.parentNode;
        }
        if (!wrap) { return; }
        var $wrap = $(wrap);

        var headerH = 0, pagerH = 0;
        var $hdrs = $wrap.find('.datagrid-header').filter(function () { return $(this).offsetParent !== null; });
        if ($hdrs.length) { headerH = $hdrs.eq(0).outerHeight(true) || 0; }
        var $pager = $wrap.find('.datagrid-pager');
        if ($pager.length && $pager.eq(0).offsetParent !== null) { pagerH = $pager.eq(0).outerHeight(true) || 0; }

        var avail = hostH - pagerH;
        if (avail < 40) { return; }
        var bodyH = avail - headerH;
        if (bodyH < 0) { bodyH = 0; }

        var $view = $wrap.find('.datagrid-view').first();
        if (!$view.length) { return; }
        if (Math.abs(avail - ($view.height() || 0)) > 2) { $view.height(avail); }
        $view.children('.datagrid-view1').each(function () { this.style.height = avail + 'px'; });
        $view.children('.datagrid-view2').each(function () { this.style.height = avail + 'px'; });
        $view.find('.datagrid-body').each(function () {
            if (Math.abs(bodyH - (this.offsetHeight || 0)) > 2) { this.style.height = bodyH + 'px'; }
        });
    } catch (e) { /* ignore */ }
}

/* 延迟多轮补高: fork 可能异步/动画式地重排高度(空数据时表现明显), 单轮补高会被随后覆盖 */
function refillGridLayersMulti(id) {
    try { refillGridLayers(id); } catch (e0) {}
    setTimeout(function () { try { refillGridLayers(id); } catch (e1) {} }, 150);
    setTimeout(function () { try { refillGridLayers(id); } catch (e2) {} }, 400);
    setTimeout(function () { try { refillGridLayers(id); } catch (e3) {} }, 900);
}

/* Tab1 四块网格: 采用四格时期的原始方案 —— fit:true 高度由 fork 自身管理,
   仅在页签切换/窗口缩放时调一次 datagrid('resize') 让 fit 重算。
   严禁在轮询中反复调用(否则 fork 按内容重排, 形成高度棘轮)。 */
function fitTab1Grids() {
    var t1 = ['dgDomain', 'dgItem', 'dgHis', 'dgCurRel'];
    for (var ti1 = 0; ti1 < t1.length; ti1++) {
        try { $('#' + t1[ti1]).datagrid('resize'); } catch(_z1) {}
    }
}

/* 各页签网格纯 DOM 补高(仅 Tab2-5 显式高度网格; 幂等, 2px 容差防抖, 可被轮询高频调用)。
   Tab1 四块为 fit:true 网格, 不在轮询里补高 —— 保持四格时期原始行为。 */
function fillActiveTab(index) {
    if (index === 0) {
        /* Tab1: 轮询不动作(容器由 applyLayout 定高, 网格由 fork fit 自管理) */
    } else if (index === 1) {
        try { refillGridLayers('dgRel'); } catch(_e1) {}
    } else if (index === 2) {
        try { refillGridLayers('dgCov'); } catch(_e2) {}
    } else if (index === 3) {
        try { refillGridLayers('dgDict'); } catch(_e3) {}
    } else if (index === 4) {
        try { refillGridLayers('dgPlat'); } catch(_e4) {}
    }
}

/* ---- 延迟初始化(参照 HQMS 页 ensureGrid 模式) ----
   现场 HISUI fork 的 datagrid 在隐藏容器里初始化时高度算成 0(列表只剩一条线),
   且 getPanel/resize 等后置方法不可用无法恢复。因此这三个页签的网格延迟到
   首次切到该页签、容器已由 applyLayout 定高后(可见)才初始化, 并直接用
   实测的 .grow 容器高度作为显式 height(显式高度在该 fork 上渲染稳定, 不依赖 fit)。 */
function growHOf(id) {
    try {
        var t = document.getElementById(id);
        if (!t || !t.parentNode) { return 0; }
        return t.parentNode.offsetHeight || 0;
    } catch (e) { return 0; }
}

/* 判断网格是否已建表(纯 DOM 判断, 不调用任何插件方法):
   未建表时 table 直接挂在 .grow 下; 建表后 table 被插件包裹, 父级不再是 .grow。
   table 元素不存在(页签未激活/被插件移出 DOM)时返回 true, 视为无需处理。 */
function gridBuilt(id) {
    try {
        var t = document.getElementById(id);
        if (!t || !t.parentNode) { return true; }
        var cls = (t.parentNode.className || '') + '';
        return cls.indexOf('grow') < 0;
    } catch (e) { return true; }
}

function tryEnsureRel() {
    if (gridBuilt('dgRel')) { return; }
    try { fillActiveTab(1); } catch (e0) {}
    var h = growHOf('dgRel');
    if (h < 60) { return; }   /* 容器尚未定高: 下个轮询周期再试 */
    ensureRelGrid(h);
    try { loadRel(1); } catch (e1) {}
}
function ensureRelGrid(h) {
    if (gridBuilt('dgRel')) { return; }
    try {
        $('#dgRel').datagrid({
            fitColumns: false, singleSelect: false, striped: true, rownumbers: true,
            pagination: true, pageSize: gRelSize, pageList: [20, 50, 100, 200], height: h,
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
    } catch (e13) {
        if (window.console) { try { console.error('[dgRel 初始化失败]', e13 && e13.message, e13); } catch (_el) {} }
    }
}

function tryEnsurePlat() {
    if (gridBuilt('dgPlat')) { return; }
    try { fillActiveTab(4); } catch (e0) {}
    var h = growHOf('dgPlat');
    if (h < 60) { return; }   /* 容器尚未定高: 下个轮询周期再试 */
    ensurePlatGrid(h);
    try { loadPlat(); } catch (e1) {}
}
function ensurePlatGrid(h) {
    if (gridBuilt('dgPlat')) { return; }
    try {
        $('#dgPlat').datagrid({
            fitColumns: true, singleSelect: true, striped: true, rownumbers: true,
            height: h,
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
    } catch (e14) {}
}

function tryEnsureDict() {
    if (gridBuilt('dgDict')) { return; }
    try { fillActiveTab(3); } catch (e0) {}
    var h = growHOf('dgDict');
    if (h < 60) { return; }   /* 容器尚未定高: 下个轮询周期再试 */
    ensureDictGrid(h);
    try { loadDict(); } catch (e1) {}
}
function ensureDictGrid(h) {
    if (gridBuilt('dgDict')) { return; }
    try {
        $('#dgDict').datagrid({
            fitColumns: false, singleSelect: true, striped: true, rownumbers: true,
            height: h,
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
    } catch (e15) {}
}

/* ============================== 初始化 ============================== */
$(function() {
    /* 统一布局: 一次性测量并按窗口尺寸定好 mainTabs/面板/各页签容器高度 */
    applyLayout();
    try { $('#btnQDomain').linkbutton({ iconCls: 'icon-search' }); } catch(e1) {}
    try { $('#btnQRel').linkbutton({ iconCls: 'icon-search' }); } catch(e2) {}
    try { $('#btnSaveRel').linkbutton({ iconCls: 'icon-save' }); } catch(e3) {}
    try { $('#btnExp').linkbutton({ iconCls: 'icon-w-export' }); } catch(e4) {}
    try { $('#btnDel').linkbutton({ iconCls: 'icon-cancel' }); } catch(e5) {}
    try { $('#btnOn').linkbutton({ iconCls: 'icon-ok' }); } catch(e6) {}
    try { $('#btnOff').linkbutton({ iconCls: 'icon-no' }); } catch(e7) {}
    try { $('#btnImpUpload').linkbutton({ iconCls: 'icon-w-import' }); } catch(e8) {}
    try { $('#btnBind').linkbutton({ iconCls: 'icon-bind' }); } catch(e9) {}

    /* ---- 主 Tab: 切换时先铺满当前页签(可见性守卫保证只作用于激活页签)。
        注意: dgRel/dgDict/dgPlat 的延迟建表不依赖 tabs 的 onSelect(现场 fork 可能不触发),
        由页面底部的 tabPoll 轮询统一驱动。这里保留 onSelect 仅做即时铺满。 */
    setupMainTabs(function(title, index) {
        setTimeout(() => {
            try { fillActiveTab(index); } catch(_zf) {}
            if (index === 0) {
                /* Tab1 fit 网格: 切回该页签时重算一次(四格时期原始行为) */
                try { fitTab1Grids(); } catch(_zt) {}
                setTimeout(function () { try { fitTab1Grids(); } catch(_zt2) {} }, 220);
            } else if (index === 1) {
                try { tryEnsureRel(); } catch(_zr) {}
                setTimeout(function () { try { fillActiveTab(1); } catch(_zf2) {} }, 220);
            } else if (index === 2) {
                setTimeout(function () { try { fillActiveTab(2); } catch(_zf3) {} }, 220);
            } else if (index === 3) {
                try { tryEnsureDict(); } catch(_zd) {}
            } else if (index === 4) {
                try { tryEnsurePlat(); } catch(_zp) {}
            }
        }, 30);
    });

    /* ---- 值域表 ---- */
    try {
        $('#dgDomain').datagrid({
            fitColumns: true, singleSelect: true, striped: true, rownumbers: true,
            pagination: false, fit: true, border: false,   /* 分页由通用自绘分页条承担 */
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
    } catch(e9) {}

    /* ---- 采集条目表 ---- */
    try {
        $('#dgItem').datagrid({
            fitColumns: true, singleSelect: false, striped: true, rownumbers: true,
            pagination: false, fit: true, border: false,
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
    } catch(e10) {}

    /* ---- HIS 字典表 ---- */
    try {
        $('#dgHis').datagrid({
            fitColumns: true, singleSelect: false, striped: true, rownumbers: true,
            pagination: false, fit: true, border: false,
            idField: 'Code', selectOnCheck: true, checkOnSelect: true,
            onBeforeLoad: function(p) { return false; },
            onLoadSuccess: function(d) { onHisLoadSuccess(d); },
            /* 行标识: easyui rowStyler 返回值按 style 应用, 用内联样式上色 */
            rowStyler: function(i, row) {
                if (hisRowIsOther(row)) { return 'background:#e8f5e9;color:#888;cursor:not-allowed;'; }
                if (hisRowIsCur(row)) { return 'background:#d8f1dc;'; }
                return '';
            },
            onClickRow: function(i, row) {
                if (hisRowIsOther(row)) {
                    try { $('#dgHis').datagrid('unselectRow', i); } catch(eA) {}
                    try { $('#dgHis').datagrid('uncheckRow', i); } catch(eB) {}
                    updateSelTip();
                }
            },
            onCheck: function(i, row) {
                if (hisRowIsOther(row)) {
                    try { $('#dgHis').datagrid('uncheckRow', i); } catch(eC) {}
                }
                updateSelTip();
            },
            onSelect: function() { updateSelTip(); },
            onUnselect: function() { updateSelTip(); },
            onSelectAll: function() { covHealAllChecked(); },
            onUnselectAll: function() { updateSelTip(); },
            onCheckAll: function() { covHealAllChecked(); },
            columns: [[
                { checkbox: true, width: 30 },
                { field: 'Code', title: 'HIS代码', width: 120 },
                { field: 'Desc', title: 'HIS描述', width: 300 }
            ]]
        });
    } catch(e11) {}

    /* ---- 当前对照表 ---- */
    try {
        $('#dgCurRel').datagrid({
            fitColumns: true, singleSelect: true, striped: true, rownumbers: true, fit: true, border: false,
            pagination: false,
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

    /* ---- 首次加载(Tab2/4/5 网格延迟初始化, 首次切到对应页签时再建表取数) ---- */
    loadPlatCombo(function() {
        loadDomain(1);
    });

    /* 初始多轮布局: 等 linkbutton/网格渲染、数据回来后再定一轮, 确保一次到位不闪跳 */
    setTimeout(function () { try { applyLayout(); } catch(_fi) {} }, 60);
    setTimeout(function () { try { applyLayout(); } catch(_fi2) {} }, 350);
    setTimeout(function () { try { applyLayout(); } catch(_fi3) {} }, 1000);
});

/* 行数据转 JSON 字面量（供 onclick 内联传参，IE11 兼容写法） */
/* 内联对象字面量放进 onclick="..." 属性: 值一律用单引号包裹,
   内容里的 \ ' " 回车换行 全部转义, 避免 SQL/枚举多行内容或引号拆断属性 */
function inlineStr(s) {
    s = String(s == null ? '' : s);
    return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;')
            .replace(/\r/g, '\\r').replace(/\n/g, '\\n');
}
function platRowJson(row) {
    return "{PlatCode:'" + inlineStr(row.PlatCode) + "',PlatName:'" + inlineStr(row.PlatName)
        + "',Version:'" + inlineStr(row.Version) + "',ActiveFlag:'" + inlineStr(row.ActiveFlag)
        + "',Memo:'" + inlineStr(row.Memo) + "'}";
}
function dictRowJson(row) {
    return "{DictCode:'" + inlineStr(row.DictCode) + "',DictName:'" + inlineStr(row.DictName)
        + "',Mode:'" + inlineStr(row.Mode) + "',SqlText:'" + inlineStr(row.SqlText || '')
        + "',ActiveFlag:'" + inlineStr(row.ActiveFlag) + "',Memo:'" + inlineStr(row.Memo || '') + "'}";
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

/* 覆盖查询: 服务端一次返回全量+统计(未做服务端切片), 前端本地分页 */
var gCovAll = [];            /* 当前查询全量行 */
var gCovMapped = 0, gCovUnmapped = 0, gCovDictName = '';

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
        Page:       1,
        Rows:       gCovSize
    }, function(rs) {
        gCovAll = (rs && rs.rows) ? rs.rows : [];
        gCovMapped = (rs && rs.mapped) ? rs.mapped : 0;
        gCovUnmapped = (rs && rs.unmapped) ? rs.unmapped : 0;
        gCovDictName = (rs && rs.dictName) ? rs.dictName : '';
        renderCovPage(page || 1);
    });
}

/* 本地分页渲染(翻页/改每页条数不重新请求) */
function renderCovPage(page) {
    var total = gCovAll.length;
    var p = (page || 1);
    if (p < 1) { p = 1; }
    var maxP = Math.max(1, Math.ceil(total / gCovSize));
    if (p > maxP) { p = maxP; }
    var start = (p - 1) * gCovSize;
    var rows = gCovAll.slice(start, start + gCovSize);
    try {
        $('#dgCov').datagrid('loadData', { total: total, rows: rows });
        var pager = $('#dgCov').datagrid('getPager');
        $(pager).pagination({
            total: total,
            pageNumber: p,
            pageSize: gCovSize,
            pageList: [20, 50, 100, 200]
        });
        try { refillGridLayersMulti('dgCov'); } catch (eR) {}
    } catch (e) { console.log('dgCov render err:', e.message); }

    var cov = total > 0 ? ((gCovMapped / total) * 100).toFixed(1) : '0.0';
    var dictName = gCovDictName ? ('「' + gCovDictName + '」') : '';
    $('#covStat').html(
        '字典 ' + dictName + ' 共 <b>' + total + '</b> 个 HIS 条目'
        + ' · 已对照 <b style="color:#27ae60;">' + gCovMapped + '</b>'
        + ' · 未对照 <b style="color:#d63031;">' + gCovUnmapped + '</b>'
        + ' · 覆盖率 <b>' + cov + '%</b>'
    );
}

/* 导出当前覆盖查询结果(与当前筛选/查询一致, 全量) */
function exportCov() {
    if (!gCovAll.length) {
        toast('请先点击【查询】后再导出', true);
        return;
    }
    var esc = function(s) {
        s = String(s == null ? '' : s);
        if (/[",\n\r]/.test(s)) { return '"' + s.replace(/"/g, '""') + '"'; }
        return s;
    };
    var lines = ['HIS代码,HIS描述,对照状态,已对照条目代码,已对照条目名称,条目数'];
    for (var i = 0; i < gCovAll.length; i++) {
        var r = gCovAll[i];
        lines.push([
            esc(r.HisCode), esc(r.HisDesc),
            (r.MappedFlag === 'Y') ? '已对照' : '未对照',
            esc(r.ItemCode), esc(r.ItemName), (r.ItemCount == null ? '' : r.ItemCount)
        ].join(','));
    }
    var plat = val('covPlat') || gPlat;
    downloadCsv(lines.join('\r\n'), '对照覆盖查询_' + plat + '_' + fmtNow() + '.csv');
    toast('导出完成：共 ' + gCovAll.length + ' 行');
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

    /* 覆盖查询分页器绑定翻页(与其它网格同款写法) */
    try {
        var pCov = $('#dgCov').datagrid('getPager');
        $(pCov).pagination({
            onSelectPage: function(pn, ps) { gCovSize = ps; renderCovPage(pn); }
        });
    } catch (eCov) { /* ignore */ }

    /* Tab2 平台/值域/HIS 字典下拉的初始化 */
    loadCovPlat(function() { loadCovDomain(); loadCovDict(); });
});

/* 窗口缩放: 防抖 150ms 后执行一次统一布局(窗口还原/最大化动画期间 resize 事件密集,
   每次事件都重排会与 fork 的内容驱动重排叠加成"高度逐步变矮"的棘轮)。
   布局全部由 applyLayout 一次性计算套用, 不再调 fork 的 tabs('resize')/datagrid('resize')。 */
var gResizeTimer = null;
$(window).on('resize', function () {
    if (gResizeTimer) { clearTimeout(gResizeTimer); }
    gResizeTimer = setTimeout(function () {
        try { applyLayout(); } catch (eR) {}
        setTimeout(function () { try { applyLayout(); } catch (eR2) {} }, 200);
    }, 150);
});

/* ============================== 页签激活轮询 ==============================
   现场 HISUI fork 的 tabs onSelect 可能不触发(点击页签无回调), 导致延迟建表永远不执行。
   这里每 400ms 轮询当前可见页签, 对激活页签执行 铺满 + 延迟建表 + 取数, 完全不依赖插件回调。
   页签识别不依赖 tabs 插件的 DOM 结构: 用每个页签内已知锚点元素(.tab1grow / dgRel / dgCov /
   dgDict / dgPlat)向上找所属 .tabWrap, 谁当前可见(offsetParent 非空且高度>0)谁就是激活页签。 */
function visibleTabIndex() {
    try {
        var probes = [
            { sel: '.tab1grow', idx: 0 },
            { sel: '#dgRel',    idx: 1 },
            { sel: '#dgCov',    idx: 2 },
            { sel: '#dgDict',   idx: 3 },
            { sel: '#dgPlat',   idx: 4 }
        ];
        for (var i = 0; i < probes.length; i++) {
            var el = document.querySelector(probes[i].sel);
            if (!el) { continue; }
            var wrap = el;
            while (wrap && wrap !== document.body && wrap !== document.documentElement) {
                var cls = (wrap.className || '') + '';
                if (cls.indexOf('tabWrap') >= 0) { break; }
                wrap = wrap.parentNode;
            }
            var probe = (wrap && wrap !== document.body && wrap !== document.documentElement) ? wrap : el;
            try {
                if (probe.offsetParent !== null && probe.offsetHeight > 0) { return probes[i].idx; }
            } catch (e2) {}
        }
        return -1;
    } catch (e) { return -1; }
}

function tabPoll() {
    try {
        var idx = visibleTabIndex();
        if (idx === 1) { tryEnsureRel(); }
        else if (idx === 3) { tryEnsureDict(); }
        else if (idx === 4) { tryEnsurePlat(); }
        if (idx >= 0) { try { fillActiveTab(idx); } catch (e) {} }
    } catch (e) { /* ignore */ }
}
setInterval(tabPoll, 400);
setTimeout(tabPoll, 600);
