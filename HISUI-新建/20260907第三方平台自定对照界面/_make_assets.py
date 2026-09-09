# -*- coding: utf-8 -*-
"""1) 生成导入用的标准 5 列 CSV
   2) 由 sanyidictmap.csp 生成可离线打开的预览 HTML（内置 HISUI/jQuery 垫片 + 模拟后端）
"""
import csv, os, html, json, re, sys

BASE = r"D:\claude code\IRIS\HISUI-新建\第三方平台自定对照界面"
SRC = BASE + r"\01代码实现"
DETAIL = BASE + r"\通用值域明细.csv"
OUT_CSV = BASE + r"\通用值域导入.csv"
OUT_HTML = SRC + r"\预览.html"

# 用法: python _make_assets.py [01代码实现目录]
#   传入目录时只做第 2 步(预览 HTML), 从该目录读 csp 并把 预览.html 生成到该目录
#   (用于给交付到其它位置的最新代码重新生成预览页)
if len(sys.argv) > 1 and sys.argv[1].strip():
    SRC = os.path.abspath(sys.argv[1])
    OUT_HTML = os.path.join(SRC, "预览.html")


# ---------------------------------------------------------------- 1. 导入 CSV
def build_import_csv():
    rows = list(csv.DictReader(open(DETAIL, encoding="utf-8-sig")))
    with open(OUT_CSV, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(["值域代码", "值域名称", "代码", "名称", "说明"])
        for r in rows:
            w.writerow([
                (r["值域代码"] or "").strip(),
                (r["值域名称"] or "").strip(),
                (r["代码"] or "").strip(),
                (r["名称"] or "").strip(),
                (r["说明"] or "").strip(),
            ])
    return len(rows)


# ---------------------------------------------------------------- 2. 预览数据
def preview_data():
    """值域清单(305) + 若干值域的真实条目 + 模拟 HIS 字典"""
    dom = list(csv.DictReader(open(BASE + r"\通用值域清单.csv", encoding="utf-8-sig")))
    det = list(csv.DictReader(open(DETAIL, encoding="utf-8-sig")))

    domains = []
    for r in dom:
        domains.append({
            "code": r["值域代码"], "name": r["值域名称"],
            "chap": r["章名"], "cnt": int(r["条目数"] or 0),
        })

    # 挑选条目数适中且常用的值域，嵌入真实条目用于演示
    pick = ["GB/T 3304-1991", "GB/T 2261.1-2003", "GB/T 2261.2-2003", "GB/T 4658-2006",
            "CV02.01.202", "CV06.00.226", "CV06.00.217", "CV05.10.022",
            "LY.00.1", "LY.00.2", "LY.00.41", "LY.00.63", "LY.00.181", "LY.00.298"]
    pickset = [p for p in pick]
    items = {}
    for r in det:
        c = r["值域代码"]
        if c not in pickset:
            continue
        items.setdefault(c, []).append({
            "code": r["代码"], "name": r["名称"], "memo": r["说明"],
        })
    # 预置几个 HIS 字典绑定（模拟已维护过对照的值域），用新的字典代码
    bound = {
        "GB/T 3304-1991": "CT_NATION",
        "LY.00.298": "CT_LOC",
        "LY.00.41":  "CT_LOC",
        "LY.00.181": "CT_SEX",
    }
    return {"domains": domains, "items": items, "bound": bound}


# ---------------------------------------------------------------- 3. 垫片 + 模拟后端
SHIM = r"""
<style>
/* ===== 离线预览垫片样式（仅预览用，正式环境由 HISUI 提供） ===== */
body { font-family: "Microsoft Yahei", "PingFang SC", sans-serif; }
.preview-note {
    background:#fff7e6; border:1px solid #ffd591; color:#ad6800;
    padding:6px 12px; font-size:12px; border-radius:4px; margin:8px 12px 0 12px;
}
.tabs { margin:10px 12px 12px 12px; background:#fff; border:1px solid var(--border); border-radius:4px; }
.tabs-head { display:flex; border-bottom:1px solid var(--border); background:linear-gradient(to bottom,#EFF5FF,#E0ECFF); }
.tabs-head .t {
    padding:6px 18px; cursor:pointer; font-size:13px; color:#0E2D5F;
    border-right:1px solid #d6e2f7; border-top-left-radius:5px; border-top-right-radius:5px;
}
.tabs-head .t.on { background:#fff; font-weight:700; }
.tabs-body > .tp { display:none; }
.tabs-body > .tp.on { display:block; }
/* datagrid 垫片 */
.dg-wrap { border:1px solid #ddd; background:#fff; overflow:auto; }
table.dg { width:100%; border-collapse:collapse; font-size:13px; }
table.dg th {
    background:#FAFAFA; height:26px; border-right:1px dashed #ccc; border-bottom:1px solid #ccc;
    color:#15428b; font-weight:600; text-align:left; padding:0 6px; white-space:nowrap;
}
table.dg td { border-right:1px dashed #eee; border-bottom:1px solid #eee; padding:3px 6px; word-break:break-all; }
table.dg tr.even td { background:#FAFAFA; }
table.dg tr.sel td { background:#FFE48D; }
table.dg tr:hover td { background:#eaf2ff; }
table.dg tr.rel-hit td { background:#d8f1dc !important; }
table.dg tr.rel-hit.sel td { background:#c4e9cc !important; }
/* 已被其他条目对照: 浅绿底色 + 复选框禁用 + 鼠标悬浮提示 */
table.dg tr.rel-locked td { background:#e8f5e9 !important; color:#888; cursor:not-allowed; }
table.dg tr.rel-locked .dg-ck { opacity:0.4; cursor:not-allowed; }
table.dg tr.rel-locked:hover td { background:#c8e6c9 !important; }
table.dg td.ck, table.dg th.ck { width:30px; text-align:center; }
.dg-empty { padding:24px; text-align:center; color:#999; font-size:13px; }
.dg-pager { display:flex; align-items:center; gap:6px; padding:4px 8px; background:#F4F4F4; border:1px solid #ddd; border-top:0; font-size:12px; }
.dg-pager button { padding:1px 8px; font-size:12px; cursor:pointer; }
.paneBody { flex: 1; overflow: hidden; display: flex; flex-direction: column; min-height: 0; }
.paneBody .dg-wrap { flex: 1 1 auto; overflow: auto; min-height: 0; }
.paneBody .dg-pager { flex: 0 0 auto; position: sticky; bottom: 0; z-index: 2; background: #F4F4F4; border-top: 1px solid #ddd; box-shadow: 0 -1px 0 #e6e6e6; }
/* Tab3 字典导入维护: 总高 700px; 平台表固定 200px, 字典注册占剩余, 字典导入自适应 */
.tabWrap.fillFull { padding: 10px; background: var(--surface); height: 700px; box-sizing: border-box; display: flex; flex-direction: column; }
.tabWrap.fillFull > .subBlock { display: flex; flex-direction: column; overflow: hidden; min-height: 0; }
.tabWrap.fillFull > .subBlock > .paneHead { flex: 0 0 auto; }
.tabWrap.fillFull > .subBlock > table.dg { flex: 1 1 auto; min-height: 0; }
.tabWrap.fillFull > .subBlock > .dg-wrap { flex: 1 1 auto; min-height: 0; overflow: auto; }
.tabWrap.fillFull > .subBlock > .dg-pager { flex: 0 0 auto; }
.tabWrap.fillFull > .subBlock > .impBox { flex: 0 0 auto; }
.tabWrap.fillFull > .subBlock > .doc { flex: 0 0 auto; }
.tabWrap.fillFull > .subBlock.subPlat { height: 200px; flex: 0 0 200px; }
.tabWrap.fillFull > .subBlock.subDict { flex: 1 1 0; min-height: 0; }
.tabWrap.fillFull > .subBlock.subImp  { flex: 0 0 auto; margin-top: 8px; }
/* tabs panel 也需要 display:block 以让 fillFull 拿到 height */
.tabs-body > .tp.on { display: flex; flex-direction: column; }
.lb {
    display:inline-block; padding:2px 12px; border:1px solid #bbb; border-radius:5px;
    background:linear-gradient(to bottom,#fff,#eee); cursor:pointer; font-size:13px; color:#333; text-decoration:none;
}
.lb:hover { background:linear-gradient(to bottom,#CDCDCD,#ECECEC); }
.win-mask { position:fixed; left:0; top:0; right:0; bottom:0; background:rgba(0,0,0,.25); z-index:9000; }
.win {
    position:fixed; z-index:9100; background:#fff; border:1px solid var(--border);
    border-radius:4px; box-shadow:0 4px 20px rgba(0,0,0,.2);
}
.win-head {
    height:30px; line-height:30px; padding:0 12px; background:var(--titlebg);
    color:var(--heading); font-weight:600; font-size:13px; border-bottom:1px solid var(--border);
}
.win-btns { padding:8px 12px; text-align:right; border-top:1px solid #eee; background:#fafbff; }
</style>

<div class="preview-note">
    <b>离线预览</b>：本页为界面效果演示，数据为内置样例（值域清单为真实解析结果，HIS 字典为模拟数据），
    后端交互由本地脚本模拟，不会读写任何数据库。正式部署请使用同级目录下的 <code>sanyidictmap.csp</code> + <code>sanyidictmap.js</code> + <code>web.YZSY.DHCSYDictMap.cls</code>。
</div>

<script type="text/javascript">
/* =======================================================================
   离线预览垫片：模拟 jQuery-EasyUI/HISUI 的 datagrid / pagination / dialog
   / linkbutton 与 $m 后端调用。仅用于本地查看界面，不参与正式部署。
   ======================================================================= */
</script>
<script type="text/javascript">
/* ---------- 极简 jQuery 兜底（无网络时） ---------- */
if (typeof jQuery === 'undefined') {
    document.documentElement.innerHTML = '<body style="padding:40px;font-family:Microsoft Yahei">'
        + '<h2 style="color:#15428b">离线预览需要 jQuery</h2>'
        + '<p>请联网后刷新本页（会自动从 CDN 加载 jQuery 1.11），或把 jquery-1.11.3.min.js 放到本目录并修改预览页引用。</p></body>';
    throw new Error('jQuery missing');
}

/* ---------- 模拟后端数据 ---------- */
var MOCK = __MOCK_JSON__;

/* 内存库：模拟 ^YZSY("SYDictMap") */
var DB = { Platform: {}, HisDict: {}, Domain: {}, Item: {}, Rel: {} };

(function initMock() {
    DB.Platform['SY']   = { name: '通用数据采集标准', ver: 'v1.6', flag: 'Y', memo: '通用平台字典(演示数据)' };
    DB.Platform['HQMS'] = { name: 'HQMS医院质量监测系统', ver: '', flag: 'N', memo: '预留接入' };
    DB.Platform['YL6']  = { name: '六医联动平台', ver: '', flag: 'N', memo: '预留接入' };

    /* HIS 字典表种子:
     *   mode='S' 时 sql 为 SQL 文本(含 FROM 子句, FROM 后面的标识符对应 window.HISDATA 的 key)
     *   mode='E' 时 sql 为枚举文本(每行 code=desc)
     * 演示用字典种子: CT_LOC(SQL) / CT_NATION(SQL) / CT_SEX(枚举) / CUSTOM_DEMO(枚举)
     */
    DB.HisDict['CT_LOC'] = {
        name: '科室字典',
        mode: 'S',
        sql:  "SELECT TOP 20 CTLOC_RowID AS id, CTLOC_Code AS code, CTLOC_Desc AS desc FROM CT_Loc ORDER BY CTLOC_Code",
        flag: 'Y',
        memo: '演示: SQL 模式 → 通过 FROM CT_Loc 拿到 HISDATA[CT_Loc]'
    };
    DB.HisDict['CT_NATION'] = {
        name: '民族字典',
        mode: 'S',
        sql:  "SELECT CTNAT_Code AS code, CTNAT_Desc AS desc FROM CT_Nation",
        flag: 'Y',
        memo: '演示: SQL 模式 → 通过 FROM CT_Nation 拿到 HISDATA[CT_Nation]'
    };
    DB.HisDict['CT_SEX'] = {
        name: '性别字典',
        mode: 'E',
        sql:  "1=男\n2=女\n9=未说明",
        flag: 'Y',
        memo: '演示: 枚举模式 → 直接列出 code=desc'
    };

    for (var i = 0; i < MOCK.domains.length; i++) {
        var d = MOCK.domains[i];
        DB.Domain[d.code] = { name: d.name, his: MOCK.bound[d.code] || '', chap: d.chap, memo: '', flag: 'Y' };
        var its = MOCK.items[d.code] || [];
        DB.Item[d.code] = {};
        for (var j = 0; j < its.length; j++) { DB.Item[d.code][its[j].code] = { name: its[j].name, memo: its[j].memo }; }
    }
    /* HIS 字典内容按 mode 区分存储:
     *   mode='S' -> HISDATA[Code] 提供结构化数据(SQL 该字段对应的"虚拟表名", 以 FROM 子句定位)
     *   mode='E' -> ENUMDATA[Code] 直接存枚举文本(每行 code=desc)
     */
    window.HISDATA = {
        /* ---- 以下是演示"SQL 取数"的虚拟表名映射(与 HISDATA.key 对应 FROM 子句) ---- */
        'CT_LOC': [
            ['1001', '心血管内科'], ['1002', '呼吸内科'], ['1003', '消化内科'], ['1004', '神经内科'],
            ['1005', '普通外科'], ['1006', '骨科'], ['1007', '妇科'], ['1008', '儿科'],
            ['1009', '急诊医学科'], ['1010', '重症医学科'], ['1011', '麻醉科'], ['1012', '医学影像科'],
            ['1013', '医学检验科'], ['1014', '药剂科'], ['1015', '中医科'], ['1016', '康复医学科'],
            ['1017', '眼科'], ['1018', '耳鼻咽喉科'], ['1019', '口腔科'], ['1020', '皮肤科']
        ],
        'CT_NATION': [
            ['01', '汉族'], ['02', '蒙古族'], ['03', '回族'], ['04', '藏族'], ['05', '维吾尔族'],
            ['06', '苗族'], ['07', '彝族'], ['08', '壮族'], ['09', '布依族'], ['10', '朝鲜族'],
            ['11', '满族'], ['12', '侗族'], ['13', '瑶族'], ['14', '白族'], ['15', '土家族']
        ],
        'DHCTARI': [
            ['110100001', '挂号费'], ['110200001', '普通门诊诊查费'], ['110200002', '专家门诊诊查费'],
            ['120100001', '重症监护'], ['120400001', '氧气吸入'], ['210101001', 'X线摄影'],
            ['220201001', 'B型超声检查'], ['250101001', '血常规'], ['250301001', '尿常规'],
            ['330100001', '局部麻醉'], ['330701001', '扁桃体切除术'], ['410000001', '针灸']
        ],
        'MRC_ID': [['J00', '急性鼻咽炎(普通感冒)'], ['I10', '原发性高血压'], ['E11', '2型糖尿病']]
    };
    window.ENUMDATA = {};  /* 枚举字典临时内容, 由 SaveHisDict 时写入 */
    /* 预置几条对照，便于演示回显（按真实首条 itemCode 绑定，避免与采样顺序错位） */
    DB.Rel['GB/T 3304-1991'] = {};
    (function () {
        var its = DB.Item['GB/T 3304-1991'] ? Object.keys(DB.Item['GB/T 3304-1991']) : [];
        var c01 = its.length > 0 ? its[0] : '01';
        /* 在该值域的真实条目里找一个对应【蒙古族】字样的代码用作 HisCode '02' */
        var c02 = c01;
        for (var k in DB.Item['GB/T 3304-1991']) {
            if (DB.Item['GB/T 3304-1991'].hasOwnProperty(k)) {
                if (/蒙古/.test(DB.Item['GB/T 3304-1991'][k].name) || /02/.test(k)) { c02 = k; break; }
            }
        }
        DB.Rel['GB/T 3304-1991'][c01] = { '01': { desc: '汉族', flag: 'Y' } };
        DB.Rel['GB/T 3304-1991'][c02] = { '02': { desc: '蒙古族', flag: 'Y' } };
    })();
    (function () {
        var its = DB.Item['LY.00.298'] ? Object.keys(DB.Item['LY.00.298']) : [];
        if (its.length) {
            DB.Rel['LY.00.298'] = {};
            DB.Rel['LY.00.298'][its[0]] = { '1001': { desc: '心血管内科', flag: 'Y' }, '1009': { desc: '急诊医学科', flag: 'Y' } };
        }
    })();
})();

function nowStr() {
    var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
}
function ok(msg) { return '{"success":true,"msg":"' + (msg || '操作成功') + '"}'; }
function err(msg) { return '{"success":false,"msg":"' + (msg || '操作失败') + '"}'; }
function esc(s) { return String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t').replace(/[\b\f]/g, function(c){return c==='\b'?'\\b':'\\f';}); }
function itemCount(code) {
    var o = DB.Item[code] || {}, n = 0, k;
    for (k in o) { if (o.hasOwnProperty(k)) { n++; } }
    return n;
}
function relStat(code) {
    var o = DB.Item[code] || {}, mapped = 0, rels = 0, k;
    for (k in o) {
        if (!o.hasOwnProperty(k)) { continue; }
        var r = (DB.Rel[code] || {})[k] || {}, h, c = 0;
        for (h in r) { if (r.hasOwnProperty(h)) { c++; } }
        if (c > 0) { mapped++; rels += c; }
    }
    return { mapped: mapped, rels: rels };
}

/* ---------- 模拟 SQL/枚举取数 ---------- */
/* 从 SELECT 语句中提取第一个 FROM 子句后的"虚拟表名", 用作 window.HISDATA 的 key */
function pickTable(sql) {
    var s = sql || '', m = s.match(/FROM\s+([A-Za-z_][\w.]*)/i);
    return m ? m[1] : '';
}
/* "1=男\n2=女" -> [{c:'1',d:'男'},{c:'2',d:'女'}] */
function parseEnum(text) {
    var out = [], lines = String(text || '').split(/\r?\n/), i, kv;
    for (i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (!line || /^\s*#/.test(line)) { continue; }
        kv = line.split('=');
        if (kv.length < 2) { continue; }
        out.push({ c: String(kv.shift()).trim(), d: kv.join('=').trim() });
    }
    return out;
}
/* 返回 [{Code,Desc}] 数组(可能附 msg 说明) */
function dictItems(dictCode, kw) {
    var hd = DB.HisDict[dictCode];
    if (!hd) { return { rows: [], msg: '字典表【' + dictCode + '】未注册' }; }
    kw = String(kw || '').toLowerCase();
    var all = [], i, r;
    if (hd.mode === 'S') {
        var t = pickTable(hd.sql || '');
        /* HISDATA 字典 key 大小写归一化查找 */
        var src = window.HISDATA[t] || window.HISDATA[t.toUpperCase()] || window.HISDATA[t.toLowerCase()] || [];
        for (i = 0; i < src.length; i++) { all.push({ Code: src[i][0], Desc: src[i][1] }); }
    } else {
        var parsed = parseEnum(hd.sql || '');
        for (i = 0; i < parsed.length; i++) { all.push({ Code: parsed[i].c, Desc: parsed[i].d }); }
    }
    var rows = [];
    for (i = 0; i < all.length; i++) {
        r = all[i];
        if (kw && String(r.Code).toLowerCase().indexOf(kw) < 0 && String(r.Desc).toLowerCase().indexOf(kw) < 0) { continue; }
        rows.push(r);
    }
    return { rows: rows, msg: '' };
}

/* ---------- 模拟 $m 后端分发 ---------- */
window.$m = function (data, cb) {
    setTimeout(function () {
        var m = data.MethodName, out = '', g = window.gPlatForMock || 'SY';
        try {
            if (m === 'QueryPlatform') {
                var arr = [], k, kw = (data.Keyword || '').toUpperCase(), af = data.ActiveFlag || '';
                for (k in DB.Platform) {
                    if (!DB.Platform.hasOwnProperty(k)) { continue; }
                    var p = DB.Platform[k];
                    if (af && p.flag !== af) { continue; }
                    if (kw && k.toUpperCase().indexOf(kw) < 0 && p.name.toUpperCase().indexOf(kw) < 0) { continue; }
                    var dc = 0, ic = 0, rc = 0, d2;
                    for (d2 in DB.Domain) { if (DB.Domain.hasOwnProperty(d2)) { dc++; ic += itemCount(d2); rc += relStat(d2).rels; } }
                    arr.push('{"PlatCode":"' + esc(k) + '","PlatName":"' + esc(p.name) + '","Version":"' + esc(p.ver) + '","ActiveFlag":"' + p.flag + '","Memo":"' + esc(p.memo) + '","DomainCnt":' + dc + ',"ItemCnt":' + ic + ',"RelCnt":' + rc + '}');
                }
                out = '{"total":' + arr.length + ',"rows":[' + arr.join(',') + ']}';
            } else if (m === 'QueryDomain') {
                var rows = [], key, kw = data.Keyword || '', mf = data.MapFlag || '';
                for (key in DB.Domain) {
                    if (!DB.Domain.hasOwnProperty(key)) { continue; }
                    var dd = DB.Domain[key];
                    if (kw && key.indexOf(kw) < 0 && dd.name.indexOf(kw) < 0) { continue; }
                    if (mf === 'D' && !dd.his) { continue; }
                    if (mf === 'M' && dd.his) { continue; }
                    var st = relStat(key);
                    rows.push('{"DomainCode":"' + esc(key) + '","DomainName":"' + esc(dd.name) + '","Chapter":"' + esc(dd.chap) + '","HisDictCode":"' + esc(dd.his) + '","HisDictName":"' + esc((DB.HisDict[dd.his] || {}).name || '') + '","MapMode":"' + (dd.his ? 'D' : 'M') + '","ActiveFlag":"' + dd.flag + '","Memo":"","ItemCnt":' + itemCount(key) + ',"MappedCnt":' + st.mapped + ',"RelCnt":' + st.rels + '}');
                }
                out = page(rows, data.Page, data.Rows);
            } else if (m === 'QueryDomainItem') {
                var it = DB.Item[data.DomainCode] || {}, r2 = [], k2, kw2 = data.Keyword || '', mfl = data.MapFlag || '';
                for (k2 in it) {
                    if (!it.hasOwnProperty(k2)) { continue; }
                    if (kw2 && k2.indexOf(kw2) < 0 && it[k2].name.indexOf(kw2) < 0) { continue; }
                    var rr = (DB.Rel[data.DomainCode] || {})[k2] || {}, hs = [], ds = [], h, cnt = 0;
                    for (h in rr) { if (rr.hasOwnProperty(h)) { cnt++; hs.push(h); ds.push(rr[h].desc); } }
                    if (mfl === 'Y' && cnt === 0) { continue; }
                    if (mfl === 'N' && cnt > 0) { continue; }
                    r2.push('{"ItemCode":"' + esc(k2) + '","ItemName":"' + esc(it[k2].name) + '","Memo":"' + esc(it[k2].memo) + '","RelCnt":' + cnt + ',"RelCodes":"' + esc(hs.join('/')) + '","RelDescs":"' + esc(ds.join('/')) + '"}');
                }
                out = page(r2, data.Page, data.Rows);
            } else if (m === 'GetHisDesc') {
                var hd13 = DB.HisDict[data.DictCode] || {};
                var di13 = dictItems(data.DictCode, '');
                var desc13 = '';
                for (var q = 0; q < di13.rows.length; q++) {
                    if (String(di13.rows[q].Code) === String(data.HisCode)) { desc13 = di13.rows[q].Desc; break; }
                }
                out = '{"success":true,"Desc":"' + esc(desc13) + '","Mode":"' + (hd13.mode || '') + '"}';
            } else if (m === 'QueryDomainHisCodes') {
                /* 取该值域下所有采集条目已对照过的 HIS 代码集合 */
                var relMap = DB.Rel[data.DomainCode] || {}, hitList = [];
                for (var ki in relMap) {
                    if (!relMap.hasOwnProperty(ki)) { continue; }
                    for (var hi in relMap[ki]) {
                        if (!relMap[ki].hasOwnProperty(hi)) { continue; }
                        if (hitList.indexOf(hi) < 0) { hitList.push(hi); }
                    }
                }
                out = '{"success":true,"HisCodes":"' + esc(hitList.join('^')) + '","Count":' + hitList.length + '}';
            } else if (m === 'QueryHisDictItem') {
                var di = dictItems(data.DictCode, data.Keyword || '');
                var mf = (data.MappedFilter || 'A').toUpperCase();
                var dom = data.DomainCode || '', plat = data.PlatCode || g;
                var rel = DB.Rel[dom] || {};
                var mappedSet = {};
                for (var ii in rel) {
                    if (!rel.hasOwnProperty(ii)) { continue; }
                    for (var jj in rel[ii]) {
                        if (rel[ii].hasOwnProperty(jj)) { mappedSet[String(jj)] = true; }
                    }
                }
                var mappedCnt = 0; for (var kk in mappedSet) { if (mappedSet.hasOwnProperty(kk)) { mappedCnt++; } }
                var filtered = [], i3;
                for (i3 = 0; i3 < di.rows.length; i3++) {
                    var code3 = String(di.rows[i3].Code);
                    var isMapped = mappedSet[code3] ? 1 : 0;
                    if (mf === 'N' && isMapped) { continue; }
                    if (mf === 'M' && !isMapped) { continue; }
                    filtered.push('{"Code":"' + esc(di.rows[i3].Code) + '","Desc":"' + esc(di.rows[i3].Desc) + '","isMapped":' + isMapped + '}');
                }
                out = '{"success":true,"msg":"' + esc(di.msg || '') + '","mappedCnt":' + mappedCnt + ',' + page(filtered, data.Page, data.Rows).substr(1);
            } else if (m === 'QueryItemRel') {
                var rr2 = (DB.Rel[data.DomainCode] || {})[data.ItemCode] || {}, r4 = [], h4;
                for (h4 in rr2) {
                    if (!rr2.hasOwnProperty(h4)) { continue; }
                    r4.push('{"HisCode":"' + esc(h4) + '","HisDesc":"' + esc(rr2[h4].desc) + '","ActiveFlag":"' + rr2[h4].flag + '","CreateUser":"demo","CreateTime":"2026-09-05 09:00","UpdateUser":"demo","UpdateTime":"' + nowStr() + '","Memo":""}');
                }
                out = '{"total":' + r4.length + ',"rows":[' + r4.join(',') + ']}';
            } else if (m === 'QueryRelByHis') {
                /* 反查: 给定(平台/值域/HIS码) → 采集条目列表 */
                var dom = data.DomainCode || '', his = data.HisCode || '',
                    plat = data.PlatCode || g, platData = DB.Domain[dom],
                    cnt = 0, rows = [];
                if (!platData) { out = '{"success":true,"found":false,"PlatCode":"' + esc(plat) + '","DomainCode":"' + esc(dom) + '","count":0,"rows":[],"msg":"值域不存在"}'; }
                else {
                    var hisDict = platData.his || '';
                    var relMap = (DB.Rel[dom] || {});
                    for (var it in relMap) {
                        if (!relMap.hasOwnProperty(it) || !relMap[it][his]) { continue; }
                        var r = relMap[it][his];
                        var iname = (DB.Item[dom] && DB.Item[dom][it]) ? DB.Item[dom][it][0] : '';
                        rows.push('{"ItemCode":"' + esc(it) + '","ItemName":"' + esc(iname) + '","HisCode":"' + esc(his) + '","HisDesc":"' + esc(r.desc) + '","ActiveFlag":"' + r.flag + '","Memo":"","UpdateTime":"' + nowStr() + '"}');
                        cnt++;
                    }
                    out = '{"success":true,"found":' + (cnt > 0 ? 'true' : 'false') +
                        ',"PlatCode":"' + esc(plat) + '","DomainCode":"' + esc(dom) + '"' +
                        ',"DomainName":"' + esc(platData.name || '') + '"' +
                        ',"HisDictCode":"' + esc(hisDict) + '"' +
                        ',"HisCode":"' + esc(his) + '"' +
                        ',"count":' + cnt + ',"rows":[' + rows.join(',') + '],' +
                        '"msg":"' + (cnt > 0 ? cnt + '个采集条目匹配' : 'HIS码尚未建立对照') + '"}';
                }
            } else if (m === 'QueryRel') {
                var r5 = [], d5, i5, h5;
                for (d5 in DB.Rel) {
                    if (!DB.Rel.hasOwnProperty(d5)) { continue; }
                    if (data.DomainCode && d5 !== data.DomainCode) { continue; }
                    for (i5 in DB.Rel[d5]) {
                        if (!DB.Rel[d5].hasOwnProperty(i5)) { continue; }
                        var itemName5 = ((DB.Item[d5] || {})[i5] || {}).name || '';
                        if (data.ItemKeyword && i5.indexOf(data.ItemKeyword) < 0 && itemName5.indexOf(data.ItemKeyword) < 0) { continue; }
                        for (h5 in DB.Rel[d5][i5]) {
                            if (!DB.Rel[d5][i5].hasOwnProperty(h5)) { continue; }
                            var o5 = DB.Rel[d5][i5][h5];
                            if (data.HisKeyword && h5.indexOf(data.HisKeyword) < 0 && o5.desc.indexOf(data.HisKeyword) < 0) { continue; }
                            if (data.ActiveFlag && o5.flag !== data.ActiveFlag) { continue; }
                            var his5 = DB.Domain[d5] ? DB.Domain[d5].his : '';
                            if (data.MapMode === 'D' && !his5) { continue; }
                            if (data.MapMode === 'M' && his5) { continue; }
                            r5.push('{"PlatCode":"' + g + '","DomainCode":"' + esc(d5) + '","DomainName":"' + esc((DB.Domain[d5] || {}).name || '') + '","ItemCode":"' + esc(i5) + '","ItemName":"' + esc(((DB.Item[d5] || {})[i5] || {}).name || '') + '","HisCode":"' + esc(h5) + '","HisDesc":"' + esc(o5.desc) + '","ActiveFlag":"' + o5.flag + '","CreateUser":"demo","CreateTime":"2026-09-05 09:00","UpdateUser":"demo","UpdateTime":"' + nowStr() + '","Memo":"","HisDictCode":"' + esc(his5) + '","HisDictName":"' + esc((DB.HisDict[his5] || {}).name || '') + '","MapMode":"' + (his5 ? 'D' : 'M') + '"}');
                        }
                    }
                }
                out = page(r5, data.Page, data.Rows);
            } else if (m === 'QueryRelCoverage') {
                /* 对照覆盖查询: 在 (platCode[, domCode]) 下, 列出 DictCode 所有 HIS 条目
                   并标注每条已被哪些 platform item 对照 */
                var dc8 = data.DictCode || '', plat8 = (data.PlatCode || g);
                var dom8 = data.DomainCode || '', filter8 = data.Filter || '';
                if (!dc8 || !(DB.HisDict[dc8])) { out = err('字典表未注册'); }
                else {
                    var hd8 = DB.HisDict[dc8];
                    var di8 = dictItems(dc8, '');
                    var r8 = [], mappedN = 0, unmapN = 0;
                    function lookupOwners(hisCode) {
                        var owners = [];
                        if (dom8) {
                            /* 限定值域 */
                            var relDom = DB.Rel[dom8] || {};
                            for (var ic in relDom) {
                                if (!relDom.hasOwnProperty(ic)) { continue; }
                                if (relDom[ic][hisCode]) {
                                    var itName = ((DB.Item[dom8] || {})[ic] || {}).name || '';
                                    owners.push({ item: ic, name: itName });
                                    if (owners.length >= 5) { break; }
                                }
                            }
                        } else {
                            /* 跨值域: 遍历平台下所有值域(本 SHIM 用单平台 g) */
                            for (var d2 in DB.Rel) {
                                if (!DB.Rel.hasOwnProperty(d2) || !DB.Rel[d2]) { continue; }
                                for (var ic2 in DB.Rel[d2]) {
                                    if (!DB.Rel[d2].hasOwnProperty(ic2)) { continue; }
                                    if (DB.Rel[d2][ic2][hisCode]) {
                                        var inName = ((DB.Item[d2] || {})[ic2] || {}).name || '';
                                        owners.push({ item: d2 + '.' + ic2, name: d2 + '.' + ic2 + (inName ? ('=' + inName) : '') });
                                        if (owners.length >= 5) { break; }
                                    }
                                }
                                if (owners.length >= 5) { break; }
                            }
                        }
                        return owners;
                    }
                    for (var i8 = 0; i8 < di8.rows.length; i8++) {
                        var row8 = di8.rows[i8];
                        var own = lookupOwners(String(row8.Code));
                        var isM = own.length > 0;
                        if (filter8 === 'U' && isM)  { continue; }
                        if (filter8 === 'M' && !isM) { continue; }
                        if (isM) { mappedN++; } else { unmapN++; }
                        var icList8 = '', inList8 = '';
                        for (var oo = 0; oo < own.length; oo++) {
                            if (oo > 0) { icList8 += ' / '; inList8 += ' / '; }
                            icList8 += own[oo].item;
                            inList8 += own[oo].name;
                        }
                        r8.push('{"HisCode":"' + esc(row8.Code) + '","HisDesc":"' + esc(row8.Desc)
                            + '","MappedFlag":"' + (isM ? 'Y' : 'N')
                            + '","ItemCode":"' + esc(icList8)
                            + '","ItemName":"' + esc(inList8)
                            + '","ItemCount":' + own.length + '}');
                    }
                    var total8 = mappedN + unmapN;
                    /* 默认按"未对照前置"排序, 让用户先看到缺口 */
                    r8.sort(function (a, b) {
                        var am = a.indexOf('"MappedFlag":"Y"') > 0 ? 1 : 0;
                        var bm = b.indexOf('"MappedFlag":"Y"') > 0 ? 1 : 0;
                        if (am !== bm) { return am - bm; }
                        return 0;
                    });
                    out = '{"success":true,"PlatCode":"' + esc(plat8) + '","DomainCode":"' + esc(dom8)
                        + '","DictCode":"' + esc(dc8) + '","DictName":"' + esc(hd8.name)
                        + '","Filter":"' + esc(filter8)
                        + '","total":' + total8 + ',"mapped":' + mappedN + ',"unmapped":' + unmapN
                        + ',"rows":[' + r8.join(',') + ']}';
                }
            } else if (m === 'QueryHisDict') {
                var r6 = [], k6;
                for (k6 in DB.HisDict) {
                    if (!DB.HisDict.hasOwnProperty(k6)) { continue; }
                    if (data.ActiveFlag && DB.HisDict[k6].flag !== data.ActiveFlag) { continue; }
                    var v6 = DB.HisDict[k6];
                    r6.push('{"DictCode":"' + esc(k6) + '","DictName":"' + esc(v6.name) + '","Mode":"' + v6.mode + '","SqlText":"' + esc(v6.sql || '') + '","ActiveFlag":"' + v6.flag + '","Memo":"' + esc(v6.memo || '') + '"}');
                }
                out = '{"total":' + r6.length + ',"rows":[' + r6.join(',') + ']}';
            } else if (m === 'SaveDictRel') {
                var dom = data.DomainCode, itm = data.ItemCode;
                DB.Rel[dom] = DB.Rel[dom] || {};
                if ((data.Mode || 'O') === 'O') {
                    /* 覆盖模式: 同步把 RelByHis 中旧快照清掉 */
                    if (DB.RelByHis && DB.RelByHis[dom]) {
                        for (var _oldHc in DB.Rel[dom][itm] || {}) {
                            if (DB.RelByHis[dom][_oldHc] && DB.RelByHis[dom][_oldHc][itm]) { delete DB.RelByHis[dom][_oldHc][itm]; }
                        }
                    }
                    DB.Rel[dom][itm] = {};
                }
                DB.Rel[dom][itm] = DB.Rel[dom][itm] || {};
                /* 反向快照存储 */
                DB.RelByHis = DB.RelByHis || {};
                DB.RelByHis[dom] = DB.RelByHis[dom] || {};
                var codes = (data.HisCodes || '').split('^'), add = 0, i7;
                for (i7 = 0; i7 < codes.length; i7++) {
                    if (!codes[i7]) { continue; }
                    var desc7 = '';
                    var his7 = (DB.Domain[dom] || {}).his || '';
                    if (his7) {
                        var di7 = dictItems(his7, codes[i7]);
                        for (var q = 0; q < di7.rows.length; q++) {
                            if (String(di7.rows[q].Code) === String(codes[i7])) { desc7 = di7.rows[q].Desc; }
                        }
                    }
                    DB.Rel[dom][itm][codes[i7]] = { desc: desc7 || codes[i7], flag: 'Y' };
                    /* 反向快照: 同时复制 ItemName 让 QueryRelByHis 单查拿到 */
                    var _iname7 = ((DB.Item[dom] || {})[itm] || {}).name || '';
                    DB.RelByHis[dom][codes[i7]] = DB.RelByHis[dom][codes[i7]] || {};
                    DB.RelByHis[dom][codes[i7]][itm] = desc7 + '^Y^^' + _iname7 + '^^^^^';
                    add++;
                }
                out = '{"success":true,"add":' + add + ',"skip":0,"msg":"保存成功' + add + '条"}';
            } else if (m === 'UpdateRel') {
                var o = ((DB.Rel[data.DomainCode] || {})[data.ItemCode] || {})[data.HisCode];
                if (!o) { out = err('对照记录不存在'); }
                else { o.desc = data.HisDesc; o.flag = data.ActiveFlag; out = ok('保存成功'); }
            } else if (m === 'DeleteRel') {
                var rm = (DB.Rel[data.DomainCode] || {})[data.ItemCode];
                if (!rm || !rm[data.HisCode]) { out = err('对照记录不存在'); }
                else { delete rm[data.HisCode]; out = ok('删除成功'); }
            } else if (m === 'ClearRel') {
                DB.Rel[data.DomainCode] = DB.Rel[data.DomainCode] || {};
                DB.Rel[data.DomainCode][data.ItemCode] = {};
                out = ok('已清空对照');
            } else if (m === 'ClearRelBatch') {
                var d6 = data.DomainCode, items = (data.ItemList || '').split('^'), cleared6 = 0, itemOk6 = 0;
                DB.Rel[d6] = DB.Rel[d6] || {};
                for (var i6 = 0; i6 < items.length; i6++) {
                    var ic6 = items[i6]; if (!ic6) { continue; }
                    var rc6 = DB.Rel[d6][ic6] || {};
                    for (var k6 in rc6) { if (rc6.hasOwnProperty(k6)) { cleared6++; } }
                    DB.Rel[d6][ic6] = {};
                    itemOk6++;
                }
                out = '{"success":true,"items":' + itemOk6 + ',"rels":' + cleared6 + ',"msg":"已处理' + itemOk6 + '个条目,共清空' + cleared6 + '条对照"}';
            } else if (m === 'RefreshRelDesc') {
                out = '{"success":true,"upd":0,"miss":0,"msg":"刷新0条"}';
            } else if (m === 'SaveDomainHisDict') {
                if (!DB.Domain[data.DomainCode]) { out = err('值域不存在'); }
                else {
                    var oldHis6 = DB.Domain[data.DomainCode].his || '';
                    var newHis6 = data.HisDictCode || '';
                    var changed6 = (oldHis6 !== newHis6);
                    DB.Domain[data.DomainCode].his = newHis6;
                    var cleared7 = 0;
                    if (changed6 && data.ClearMappings && data.ClearMappings !== 'N') {
                        DB.Rel[data.DomainCode] = DB.Rel[data.DomainCode] || {};
                        for (var ii in DB.Rel[data.DomainCode]) {
                            if (!DB.Rel[data.DomainCode].hasOwnProperty(ii)) { continue; }
                            for (var hh in DB.Rel[data.DomainCode][ii]) {
                                if (DB.Rel[data.DomainCode][ii].hasOwnProperty(hh)) { cleared7++; }
                            }
                            DB.Rel[data.DomainCode][ii] = {};
                        }
                    }
                    out = '{"success":true,"changed":' + (changed6 ? 'true' : 'false') + ',"cleared":' + cleared7 + ',"msg":"保存成功"}';
                }
            } else if (m === 'SaveHisDict') {
                /* 新签名: DictCode/DictName/Mode/SqlText/ActiveFlag/Memo */
                if (!data.DictCode) { out = err('字典代码不能为空'); }
                else {
                    var mode = (data.Mode || 'S');
                    if (mode !== 'S' && mode !== 'E') { mode = 'S'; }
                    DB.HisDict[data.DictCode] = {
                        name: data.DictName || data.DictCode,
                        mode: mode,
                        sql:  data.SqlText || '',
                        flag: data.ActiveFlag || 'N',
                        memo: data.Memo || ''
                    };
                    out = ok('保存成功');
                }
            } else if (m === 'DeleteHisDict') {
                /* 已被值域绑定时不允许删除 */
                var boundBy = [];
                for (var bd in DB.Domain) {
                    if (!DB.Domain.hasOwnProperty(bd) || !DB.Domain[bd]) { continue; }
                    if (DB.Domain[bd].his === data.DictCode) { boundBy.push(bd); }
                }
                if (boundBy.length) { out = err('已被【' + boundBy.join(',') + '】绑定，无法删除'); }
                else { delete DB.HisDict[data.DictCode]; out = ok('删除成功'); }
            } else if (m === 'GetHisDict') {
                var hd = DB.HisDict[data.DictCode] || {};
                out = '{"success":true,"row":{"DictCode":"' + esc(data.DictCode) + '","DictName":"' + esc(hd.name || '')
                    + '","Mode":"' + (hd.mode || 'S') + '","SqlText":"' + esc(hd.sql || '') + '","ActiveFlag":"' + (hd.flag || 'N')
                    + '","Memo":"' + esc(hd.memo || '') + '"}}';
            } else if (m === 'SavePlatform') {
                DB.Platform[data.PlatCode] = { name: data.PlatName, ver: data.Version, flag: data.ActiveFlag, memo: data.Memo };
                out = ok('保存成功');
            } else if (m === 'DeletePlatform') {
                delete DB.Platform[data.PlatCode]; out = ok('删除成功');
            } else if (m === 'SetRelFlagBatch') {
                var ids = (data.IdList || '').split('^'), n8 = 0, i8;
                for (i8 = 0; i8 < ids.length; i8++) {
                    var pp = ids[i8].split('|');
                    var o8 = ((DB.Rel[pp[0]] || {})[pp[1]] || {})[pp[2]];
                    if (o8) { o8.flag = data.ActiveFlag; n8++; }
                }
                out = '{"success":true,"ok":' + n8 + ',"err":0,"msg":"共处理' + n8 + '条"}';
            } else if (m === 'DeleteRelBatch') {
                var idl = (data.IdList || '').split('^'), n9 = 0, i9;
                for (i9 = 0; i9 < idl.length; i9++) {
                    var p9 = idl[i9].split('|');
                    var o9 = (DB.Rel[p9[0]] || {})[p9[1]];
                    if (o9 && o9[p9[2]]) { delete o9[p9[2]]; n9++; }
                }
                out = '{"success":true,"ok":' + n9 + ',"err":0,"msg":"删除' + n9 + '条"}';
            } else if (m === 'ProbeHisDict') {
                var di9 = dictItems(data.DictCode, ''), smp = [], ix;
                for (ix = 0; ix < di9.rows.length && ix < 5; ix++) {
                    var preview = (di9.rows[ix].Code || '') + ' = ' + (di9.rows[ix].Desc || '');
                    smp.push('{"code":"' + esc(di9.rows[ix].Code) + '","desc":"' + esc(di9.rows[ix].Desc) + '","raw":"' + esc(preview) + '"}');
                }
                var dd9 = DB.HisDict[data.DictCode] || {};
                var sqlShort = (dd9.sql || '');
                if (sqlShort.length > 80) { sqlShort = sqlShort.substring(0, 80) + ' ...'; }
                out = '{"success":true,"DictCode":"' + esc(data.DictCode) + '","Mode":"' + (dd9.mode || '')
                    + '","CodeField":"code","DescField":"desc","SqlText":"' + esc(sqlShort)
                    + '","samples":[' + smp.join(',') + '],"msg":"' + esc(di9.msg || '') + '"}';
            } else if (m === 'ImportDomainCSV') {
                var lines = (data.CsvText || '').split('\n'), nA = 0, nD = 0, ia;
                for (ia = 1; ia < lines.length; ia++) {
                    var ln = lines[ia];
                    if (!ln || !ln.replace(/\s/g, '')) { continue; }
                    var f = ln.split(',');
                    if (!f[0]) { continue; }
                    if (!DB.Domain[f[0]]) { DB.Domain[f[0]] = { name: f[1] || f[0], his: '', chap: '', memo: '', flag: 'Y' }; nD++; }
                    if (f[2]) { DB.Item[f[0]] = DB.Item[f[0]] || {}; DB.Item[f[0]][f[2]] = { name: f[3] || '', memo: f[4] || '' }; nA++; }
                }
                out = '{"success":true,"item":' + nA + ',"domain":' + nD + ',"msg":"导入完成: 值域' + nD + '个, 条目' + nA + '条"}';
            } else if (m === 'ImportDomainRows') {
                /* 上传导入: JsonText = [{domCode,domName,itemCode,itemName,memo}, ...] 每批 ≤3000 行 */
                var platImp = data.PlatCode || g;
                if (!DB.Platform[platImp]) {
                    out = '{"success":false,"msg":"平台不存在,请先维护平台"}';
                } else {
                    var arrImp = [];
                    try { arrImp = JSON.parse(data.JsonText || '[]'); } catch (eImp) { arrImp = null; }
                    if (!arrImp) {
                        out = '{"success":false,"msg":"JSON解析失败"}';
                    } else {
                        var nRi = 0, nDi = 0;
                        if (String(data.ClearFlag || '').toUpperCase() === 'Y') {
                            for (var ck in DB.Item) { if (DB.Item.hasOwnProperty(ck)) { delete DB.Item[ck]; } }
                            for (var cr in DB.Rel)  { if (DB.Rel.hasOwnProperty(cr))  { delete DB.Rel[cr]; } }
                            for (var cd in DB.Domain) { if (DB.Domain.hasOwnProperty(cd)) { DB.Domain[cd].his = ''; } }
                        }
                        for (var ir = 0; ir < arrImp.length; ir++) {
                            var ro = arrImp[ir] || {};
                            var dco = String(ro.domCode == null ? '' : ro.domCode).replace(/^\ufeff/, '').replace(/^\s+|\s+$/g, '');
                            if (!dco) { continue; }
                            if (!DB.Domain[dco]) {
                                DB.Domain[dco] = { name: String(ro.domName || dco), his: '', chap: '', memo: '', flag: 'Y' };
                                nDi++;
                            } else if (ro.domName) {
                                DB.Domain[dco].name = String(ro.domName);
                            }
                            if (ro.itemCode !== '' && ro.itemCode != null) {
                                DB.Item[dco] = DB.Item[dco] || {};
                                DB.Item[dco][String(ro.itemCode)] = { name: String(ro.itemName || ''), memo: String(ro.memo || '') };
                                nRi++;
                            }
                        }
                        out = '{"success":true,"item":' + nRi + ',"domain":' + nDi + ',"err":0,"msg":"导入完成: 值域' + nDi + '个, 条目' + nRi + '条"}';
                    }
                }
            } else if (m === 'ImportDomainFile') {
                /* 服务器路径导入(预览模拟): 路径含 notfound/不存在 视为失败, 否则导入一份内置样例文件 */
                var fpImp = String(data.FilePath || '');
                var platF = data.PlatCode || g;
                if (!DB.Platform[platF]) {
                    out = '{"success":false,"msg":"平台不存在,请先维护平台"}';
                } else if (!fpImp) {
                    out = '{"success":false,"msg":"文件路径不能为空"}';
                } else if (/notfound|不存在/i.test(fpImp)) {
                    out = '{"success":false,"msg":"文件打开失败"}';
                } else {
                    var demoFile = [
                        ['DEMO.FILE.001', '服务器路径导入演示值域', '1', '演示条目一', ''],
                        ['DEMO.FILE.001', '服务器路径导入演示值域', '2', '演示条目二', ''],
                        ['DEMO.FILE.001', '服务器路径导入演示值域', '3', '演示条目三', ''],
                        ['DEMO.FILE.002', '路径导入第二个值域',       'A', '示例A',     '']
                    ];
                    var nF = 0, nDF = 0;
                    if (String(data.ClearFlag || '').toUpperCase() === 'Y') {
                        for (var ckF in DB.Item) { if (DB.Item.hasOwnProperty(ckF)) { delete DB.Item[ckF]; } }
                        for (var crF in DB.Rel)  { if (DB.Rel.hasOwnProperty(crF))  { delete DB.Rel[crF]; } }
                        for (var cdF in DB.Domain) { if (DB.Domain.hasOwnProperty(cdF)) { DB.Domain[cdF].his = ''; } }
                    }
                    for (var iF = 0; iF < demoFile.length; iF++) {
                        var rF = demoFile[iF];
                        if (!DB.Domain[rF[0]]) { DB.Domain[rF[0]] = { name: rF[1], his: '', chap: '', memo: '', flag: 'Y' }; nDF++; }
                        DB.Item[rF[0]] = DB.Item[rF[0]] || {};
                        DB.Item[rF[0]][rF[2]] = { name: rF[3], memo: rF[4] };
                        nF++;
                    }
                    out = '{"success":true,"item":' + nF + ',"domain":' + nDF + ',"msg":"（预览模拟）已读取 ' + esc(fpImp) + ' : 值域' + nDF + '个, 条目' + nF + '条"}';
                }
            } else if (m === 'ExportRel') {
                var csv = '平台代码,值域代码,值域名称,采集代码,采集名称,HIS代码,HIS描述,状态\n', da, ib, hb;
                for (da in DB.Rel) {
                    if (!DB.Rel.hasOwnProperty(da)) { continue; }
                    for (ib in DB.Rel[da]) {
                        if (!DB.Rel[da].hasOwnProperty(ib)) { continue; }
                        for (hb in DB.Rel[da][ib]) {
                            if (!DB.Rel[da][ib].hasOwnProperty(hb)) { continue; }
                            csv += 'SY,' + da + ',' + (DB.Domain[da] || {}).name + ',' + ib + ',' + ((DB.Item[da] || {})[ib] || {}).name + ',' + hb + ',' + DB.Rel[da][ib][hb].desc + ',' + DB.Rel[da][ib][hb].flag + '\n';
                        }
                    }
                }
                out = csv;
            } else {
                out = err('预览模式未实现的方法: ' + m);
            }
        } catch (ex) {
            out = err(String(ex));
        }
        if (cb) { cb(out); }
    }, 60);
};

function page(rows, p, r) {
    p = parseInt(p || 1, 10); r = parseInt(r || 20, 10);
    if (r <= 0) { return '{"total":' + rows.length + ',"rows":[' + rows.join(',') + ']}'; }
    var total = rows.length;
    var start = (p - 1) * r;
    var end = Math.min(start + r, total);
    var sel = [];
    for (var i = start; i < end; i++) { if (rows[i] != null) { sel.push(rows[i]); } }
    return '{"total":' + total + ',"rows":[' + sel.join(',') + ']}';
}
window.gPlatForMock = 'SY';
var _origVal = null;

/* ======================= datagrid / pagination / dialog 垫片 ======================= */
(function ($) {
    function renderGrid($t) {
        var st = $t.data('dgState');
        if (!st) { return; }
        var o = st.opts, data = st.data || { total: 0, rows: [] };
        var cols = (o.columns && o.columns[0]) || [];
        var hasCk = false, i;
        for (i = 0; i < cols.length; i++) { if (cols[i].checkbox) { hasCk = true; } }
        var w = $t.closest('.paneBody');
        var host = w.length ? w : $t.parent();
        var box = host.children('.dg-wrap');
        if (!box.length) {
            box = $('<div class="dg-wrap"></div>');
            var pager = $('<div class="dg-pager"></div>');
            host.append(box).append(pager);
            $t.hide();
        }
        var h = '<table class="dg"><thead><tr>';
        if (hasCk) { h += '<th class="ck"><input type="checkbox" class="dg-ckall"></th>'; }
        for (i = 0; i < cols.length; i++) {
            if (cols[i].checkbox) { continue; }
            h += '<th style="width:' + (cols[i].width || 100) + 'px">' + (cols[i].title || cols[i].field || '') + '</th>';
        }
        h += '</tr></thead><tbody>';
        if (!data.rows.length) {
            h += '<tr><td colspan="' + (cols.length) + '"><div class="dg-empty">暂无数据</div></td></tr>';
        }
        for (i = 0; i < data.rows.length; i++) {
            var row = data.rows[i];
            var cls = (i % 2 === 1 ? 'even' : '') + (st.sel && st.sel[i] ? ' sel' : '');
            /* 业务要求的"已对照"高亮: 若 row.__relHit==true 或 row.isMapped, 加 rel-hit + rel-locked class */
            if (row && row.__relHit) { cls += ' rel-hit'; }
            var isMappedRow = row && (row.isMapped === 1 || row.isMapped === '1' || row.isMapped === true);
            if (isMappedRow) { cls += ' rel-hit rel-locked'; row.__relHit = true; }
            h += '<tr class="' + cls + '" data-i="' + i + '">';
            if (hasCk) {
                var ckDisabled = isMappedRow ? ' disabled title="该 HIS 代码已被其他采集条目对照, 不能再重复对照"' : '';
                h += '<td class="ck"><input type="checkbox" class="dg-ck"' + (st.sel && st.sel[i] ? ' checked' : '') + ckDisabled + '></td>';
            }
            for (var j = 0; j < cols.length; j++) {
                if (cols[j].checkbox) { continue; }
                var v = row[cols[j].field];
                var txt = cols[j].formatter ? cols[j].formatter(v, row, i) : (v == null ? '' : String(v));
                h += '<td>' + txt + '</td>';
            }
            h += '</tr>';
        }
        h += '</tbody></table>';
        box.html(h);
        var ph = host.children('.dg-pager');
        $t.data('dgPagerEl', ph);
        if (o.pagination) {
            ph.show().html('<span>共 ' + (data.total || 0) + ' 条</span>'
                + '<button class="pg-prev">上一页</button><span class="pg-no">' + (st.page || 1) + '</span>'
                + '<button class="pg-next">下一页</button><span>每页 ' + (o.pageSize || 20) + '</span>');
            ph.find('.pg-prev').off('click').on('click', function () {
                var st2 = $t.data('dgState'); st2.page = Math.max(1, (st2.page || 1) - 1);
                if (st2.onPage) { st2.onPage(st2.page); }
            });
            ph.find('.pg-next').off('click').on('click', function () {
                var st2 = $t.data('dgState'); st2.page = (st2.page || 1) + 1;
                if (st2.onPage) { st2.onPage(st2.page); }
            });
        } else { ph.hide(); }
        /* 事件 — 使用事件委托绑定到 box, 即使 box.html() 替换内部 DOM 也能正确触发 */
        box.off('change', '.dg-ck').on('change', '.dg-ck', function () {
            var tr = $(this).closest('tr'), idx = parseInt(tr.attr('data-i'), 10);
            var st3 = $t.data('dgState');
            st3.sel = st3.sel || [];
            st3.sel[idx] = this.checked;
            tr.toggleClass('sel', this.checked);
            /* 多选模式: 业务回调 onCheck 必须被触发, 否则前端 selectItem 等钩子不会跑 */
            if (this.checked && o.onCheck) { o.onCheck(idx, st3.data.rows[idx]); }
            if (!this.checked && o.onUncheck) { o.onUncheck(idx, st3.data.rows[idx]); }
            updateSel($t);
        });
        box.off('change', '.dg-ckall').on('change', '.dg-ckall', function () {
            var st4 = $t.data('dgState'), on = this.checked;
            st4.sel = st4.sel || [];
            for (var k = 0; k < st4.data.rows.length; k++) { st4.sel[k] = on; }
            renderGrid($t);
            updateSel($t);
        });
        /* 行点击: 单选/多选都响应
         *   单选 → 仅高亮 + 触发 onSelect
         *   多选 → 切换该行 checkbox 状态(已勾选取消, 未勾选勾上), 触发 onCheck/onUncheck
         */
        box.off('click', 'tbody tr').on('click', 'tbody tr', function (e) {
            if ($(e.target).is('input')) { return; }
            var idx = parseInt($(this).attr('data-i'), 10);
            var st5 = $t.data('dgState');
            if (o.singleSelect) {
                box.find('tbody tr').removeClass('sel');
                $(this).addClass('sel');
                if (o.onSelect) { o.onSelect(idx, st5.data.rows[idx]); }
            } else {
                /* 多选: 切换该行 checkbox */
                var $ck = $(this).find('.dg-ck');
                if (!$ck.length || $ck.prop('disabled')) { return; }
                var now = !!st5.sel[idx];
                st5.sel[idx] = !now;
                $ck.prop('checked', !now);
                $(this).toggleClass('sel', !now);
                if (!now && o.onCheck) { o.onCheck(idx, st5.data.rows[idx]); }
                if (now && o.onUncheck) { o.onUncheck(idx, st5.data.rows[idx]); }
                updateSel($t);
            }
        });
    }
    function updateSel($t) {
        var st = $t.data('dgState');
        if (st && st.opts.onSelect) { /* 多选回调由页面 updateSelTip 处理 */ }
        try { if (typeof updateSelTip === 'function') { updateSelTip(); } } catch (e) {}
    }

    $.fn.datagrid = function (arg) {
        if (typeof arg === 'string') {
            var a = Array.prototype.slice.call(arguments, 1);
            var $t = this, st = $t.data('dgState');
            if (arg === 'loadData') {
                st.data = a[0] || { total: 0, rows: [] };
                st.sel = [];
                $t.data('dgState', st);
                renderGrid($t);
                if (st.opts.onLoadSuccess) { st.opts.onLoadSuccess(st.data); }
                return $t;
            } else if (arg === 'getRows') {
                return (st && st.data) ? st.data.rows : [];
            } else if (arg === 'getSelections') {
                var out = [], rows = (st && st.data) ? st.data.rows : [], i;
                for (i = 0; i < rows.length; i++) { if (st.sel && st.sel[i]) { out.push(rows[i]); } }
                return out;
            } else if (arg === 'getChecked') {
                /* 与 getSelections 一致, 因为 SHIM 没有单独的 checked/selected 区分 */
                var out2 = [], rows2 = (st && st.data) ? st.data.rows : [], i2;
                for (i2 = 0; i2 < rows2.length; i2++) { if (st.sel && st.sel[i2]) { out2.push(rows2[i2]); } }
                return out2;
            } else if (arg === 'checkRow') {
                st.sel = st.sel || []; st.sel[a[0]] = true;
                $t.data('dgState', st);
                var pb = $t.closest('.paneBody');
                if (!pb.length) { pb = $t.parent(); }
                var tr = pb.find('.dg-wrap tbody tr[data-i=' + a[0] + ']');
                tr.addClass('sel').find('.dg-ck').prop('checked', true);
                return $t;
            } else if (arg === 'uncheckRow') {
                st.sel = st.sel || []; st.sel[a[0]] = false;
                $t.data('dgState', st);
                var pb2 = $t.closest('.paneBody');
                if (!pb2.length) { pb2 = $t.parent(); }
                var tr2 = pb2.find('.dg-wrap tbody tr[data-i=' + a[0] + ']');
                tr2.removeClass('sel').find('.dg-ck').prop('checked', false);
                return $t;
            } else if (arg === 'clearSelections') {
                st.sel = []; $t.data('dgState', st); renderGrid($t); return $t;
            } else if (arg === 'selectRow') {
                st.sel = st.sel || []; st.sel[a[0]] = true;
                $t.data('dgState', st); renderGrid($t);
                if (st.opts.onSelect) { st.opts.onSelect(a[0], st.data.rows[a[0]]); }
                return $t;
            } else if (arg === 'getPager') {
                var pg = $t.data('dgPagerEl');
                if (!pg) { pg = $('<div></div>'); $t.data('dgPagerEl', pg); }
                return pg;
            } else if (arg === 'options') {
                return st.opts;
            }
            return $t;
        }
        return this.each(function () {
            var $t = $(this);
            var st = { opts: arg, data: { total: 0, rows: [] }, sel: [], page: 1, onPage: null };
            $t.data('dgState', st);
            renderGrid($t);
        });
    };
    $.fn.pagination = function (arg) {
        if (arg && arg.onSelectPage) {
            var $host = this.closest('.paneBody');
            var $tbl = $host.children('table').first();
            if (!$tbl.length) {
                var $p = this.parent();
                $tbl = $p.children('table').first();
            }
            var st = $tbl.data('dgState');
            if (st) { st.onPage = function (p) { arg.onSelectPage(p, st.opts.pageSize); }; $tbl.data('dgState', st); }
        }
        return this;
    };
    $.fn.dialog = function (arg) {
        if (typeof arg === 'string') {
            if (arg === 'close') { this.hide(); $('.win-mask').remove(); return this; }
            if (arg === 'open') { this.show(); return this; }
            return this;
        }
        var $d = this;
        $('.win-mask').remove();
        $('<div class="win-mask"></div>').appendTo('body');
        var title = arg.title || '';
        var w = arg.width || 520;
        var btns = arg.buttons || [];
        var bh = '';
        for (var i = 0; i < btns.length; i++) { bh += '<a class="lb" data-i="' + i + '">' + btns[i].text + '</a> '; }
        $d.addClass('win').css({ width: w + 'px', left: Math.max(20, (window.innerWidth - w) / 2) + 'px', top: arg.top || 70 });
        $d.html('<div class="win-head">' + title + '</div><div class="win-body">' + $d.html() + '</div><div class="win-btns">' + bh + '</div>');
        $d.show();
        $d.find('.win-btns .lb').each(function () {
            var i2 = parseInt($(this).attr('data-i'), 10);
            $(this).on('click', function () { btns[i2].handler(); });
        });
        $d.find('.win-body').css({ padding: '12px', maxHeight: '440px', overflow: 'auto' });
        return this;
    };
    $.fn.linkbutton = function () { return this.addClass('lb'); };
    $.fn.combobox = function () { return this; };
    $.fn.textbox = function () { return this; };

    /* ---- tabs 基础垫片: 渲染 head/body, 支持 .tabs({...}), .tabs('select', idx), .tabs('getSelected') ---- */
    $.fn.tabs = function (arg, param) {
        var $t = this;
        if ($t.attr('data-tabs-init') !== '1') {
            $t.attr('data-tabs-init', '1');
            $t.data('tabsSel', 0);
            var $panels = $t.children('div[title]');
            $panels.each(function (i) {
                $(this).attr('data-tab-idx', i);
            });
            $t.data('tabsPanels', $panels);
        }
        var panels = $t.data('tabsPanels');
        if (typeof arg === 'object' && arg !== null) {
            /* 初始化回调 */
            $t.data('tabsCb', arg.onSelect || null);
            return $t;
        }
        if (arg === 'select') {
            var idx = (typeof param === 'number') ? param
                : (typeof param === 'string') ? panels.index($t.find('div[title="' + param + '"]')) : 0;
            if (idx < 0) { idx = 0; }
            panels.hide(); panels.eq(idx).show();
            $t.data('tabsSel', idx);
            var cb = $t.data('tabsCb');
            if (cb) { cb(panels.eq(idx).attr('title') || '', idx); }
            return $t;
        }
        if (arg === 'getSelected') {
            var cur = $t.data('tabsSel');
            /* callable object: 调用返回 index; 同时 .index 属性也返回 index */
            var r = function () { return cur; };
            Object.defineProperty(r, 'index', { get: function () { return cur; } });
            return r;
        }
        return $t;
    };
})(jQuery);

/* tabs 垫片 */
$(function () {
    var $tabs = $('#mainTabs');
    if (!$tabs.length) { return; }
    var $panels = $tabs.children('div[title]');
    var head = $('<div class="tabs-head"></div>');
    var body = $('<div class="tabs-body"></div>');
    $panels.each(function (i) {
        var t = $(this).attr('title');
        head.append($('<div class="t' + (i === 0 ? ' on' : '') + '"></div>').text(t).attr('data-i', i));
        $(this).addClass('tp' + (i === 0 ? ' on' : '')).attr('data-i', i);
        body.append(this);
    });
    $tabs.empty().append(head).append(body);
    head.on('click', '.t', function () {
        var i = $(this).attr('data-i');
        head.children('.t').removeClass('on');
        $(this).addClass('on');
        body.children('.tp').removeClass('on');
        body.children('.tp[data-i=' + i + ']').addClass('on');
        $(window).resize();
    });
});
</script>
"""


def build_preview():
    csp = open(SRC + r"\sanyidictmap.csp", encoding="utf-8-sig").read()
    # 去 CSP 包装
    csp = csp.split("</csp:method>", 1)[1]
    csp = csp.replace("</csp:content>", "").replace("</html>", "").strip()
    csp = csp.replace('<EXTHEALTH:HEAD></EXTHEALTH:HEAD>', '')
    csp = csp.replace('<HISUI/>', '')
    csp = csp.replace('src="../scripts/sanyidictmap.js"', 'src="sanyidictmap.js"')

    # jQuery 必须在业务 JS 之前加载（正式环境由 <HISUI/> 提供，预览环境手动注入到 <head>）
    JQ = ('<script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>\n'
          '<script>if (typeof jQuery === "undefined") { document.write(\'<script src="jquery-1.11.3.min.js"><\\/script>\'); }</script>\n')
    if '<head>' in csp:
        csp = csp.replace('<head>', '<head>\n' + JQ, 1)

    data = preview_data()
    shim = SHIM.replace("__MOCK_JSON__", json.dumps(data, ensure_ascii=False))
    # 在 </body> 前插入垫片（垫片须先于业务 JS 执行）
    idx = csp.rindex("</body>")
    head = csp[:idx]
    tail = csp[idx:]
    out = head + shim + "\n" + tail
    with open(OUT_HTML, "w", encoding="utf-8-sig", newline="") as f:
        f.write(out)
    return len(out.encode("utf-8")), len(data["domains"]), sum(len(v) for v in data["items"].values())


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1].strip():
        # 指定外部 01代码实现 目录: 只重新生成预览 HTML(数据仍取本目录 CSV)
        size, nd, ni = build_preview()
        print("源码目录 =", SRC)
        print("预览HTML = %.1f KB, 值域 %d 个, 嵌入条目 %d 条" % (size / 1024.0, nd, ni))
    else:
        n = build_import_csv()
        print("导入CSV 行数 =", n)
        size, nd, ni = build_preview()
        print("预览HTML = %.1f KB, 值域 %d 个, 嵌入条目 %d 条" % (size / 1024.0, nd, ni))
