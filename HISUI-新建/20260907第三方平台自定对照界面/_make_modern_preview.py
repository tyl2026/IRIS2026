# -*- coding: utf-8 -*-
"""为现代化版 sanyidictmap.csp 生成可离线打开的 预览.html
   - 注入 jQuery(CDN + 本地回退)
   - 注入模拟后端 window.$m (内存库 DB, 响应结构与 web.YZSY.DHCSYDictMap 一致)
   - 演示数据: 305 个真实值域 + 常用值域真实条目 + 模拟 HIS 字典
用法: python _make_modern_preview.py [01代码实现目录]
"""
import csv, json, sys, os

BASE = r"D:\claude code\IRIS\HISUI-新建\第三方平台自定对照界面"
SRC = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(BASE, "01代码实现"))
OUT_HTML = os.path.join(SRC, "预览.html")


def preview_data():
    dom = list(csv.DictReader(open(os.path.join(BASE, "通用值域清单.csv"), encoding="utf-8-sig")))
    det = list(csv.DictReader(open(os.path.join(BASE, "通用值域明细.csv"), encoding="utf-8-sig")))
    domains = [{"code": r["值域代码"], "name": r["值域名称"], "chap": r["章名"]} for r in dom]
    pick = ["GB/T 3304-1991", "GB/T 2261.1-2003", "GB/T 2261.2-2003", "GB/T 4658-2006",
            "CV02.01.202", "CV06.00.226", "CV06.00.217", "CV05.10.022",
            "LY.00.1", "LY.00.2", "LY.00.41", "LY.00.63", "LY.00.181", "LY.00.298"]
    items = {}
    for r in det:
        c = r["值域代码"]
        if c not in pick:
            continue
        items.setdefault(c, []).append({"code": r["代码"], "name": r["名称"], "memo": r["说明"]})
    bound = {
        "GB/T 3304-1991": "CT_NATION",
        "LY.00.298": "CT_LOC",
        "LY.00.41": "CT_LOC",
        "LY.00.181": "CT_SEX",
    }
    return {"domains": domains, "items": items, "bound": bound}


MOCK_JS = r"""
/* ======================================================================
   离线预览 · 模拟后端 (仅预览用, 不参与正式部署)
   内存库结构对齐 ^YZSY("SYDictMap"): Platform/HisDict/Domain/Item/Rel/RelByHis
   ====================================================================== */
(function () {
if (typeof window.jQuery === 'undefined') {
    document.documentElement.innerHTML = '<body style="padding:40px;font-family:Microsoft Yahei">'
        + '<h2 style="color:#3167f6">离线预览需要 jQuery</h2>'
        + '<p>请联网后刷新本页(自动从 CDN 加载), 或把 jquery-1.11.3.min.js 放到本目录。</p></body>';
    throw new Error('jQuery missing');
}
var MOCK = __MOCK_JSON__;
var DB = { Platform: {}, HisDict: {}, Domain: {}, Item: {}, Rel: {}, RelByHis: {} };
var g = 'SY';   /* 单平台演示 */

function esc(s) {
    return String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
        .replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
}
function ok(msg) { return '{"success":true,"msg":"' + (msg || '操作成功') + '"}'; }
function err(msg) { return '{"success":false,"msg":"' + (msg || '操作失败') + '"}'; }
function nowStr() {
    var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
}
function page(arr, pg, rows) {
    pg = Math.max(1, +pg || 1); rows = Math.max(0, +rows || 20);
    var start = (pg - 1) * rows;
    return '{"total":' + arr.length + ',"rows":[' + arr.slice(start, start + rows).join(',') + ']}';
}
function pickTable(sql) {
    var m = String(sql || '').match(/FROM\s+([A-Za-z_][\w.]*)/i);
    return m ? m[1] : '';
}
function parseEnum(text) {
    var out = [], lines = String(text || '').split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (!line || /^\s*#/.test(line)) { continue; }
        var kv = line.split('=');
        if (kv.length < 2) { continue; }
        out.push({ c: kv.shift().replace(/^\s+|\s+$/g, ''), d: kv.join('=').replace(/^\s+|\s+$/g, '') });
    }
    return out;
}
function dictItems(dictCode, kw) {
    var hd = DB.HisDict[dictCode];
    if (!hd) { return { rows: [], msg: '字典表【' + dictCode + '】未注册' }; }
    kw = String(kw || '').toLowerCase();
    var all = [], i;
    if (hd.mode === 'S') {
        var t = pickTable(hd.sql);
        var src = window.HISDATA[t] || window.HISDATA[t.toUpperCase()] || window.HISDATA[t.toLowerCase()] || [];
        for (i = 0; i < src.length; i++) { all.push({ Code: src[i][0], Desc: src[i][1] }); }
    } else {
        var parsed = parseEnum(hd.sql);
        for (i = 0; i < parsed.length; i++) { all.push({ Code: parsed[i].c, Desc: parsed[i].d }); }
    }
    var rows = [];
    for (i = 0; i < all.length; i++) {
        if (kw && String(all[i].Code).toLowerCase().indexOf(kw) < 0 && String(all[i].Desc).toLowerCase().indexOf(kw) < 0) { continue; }
        rows.push(all[i]);
    }
    return { rows: rows, msg: '' };
}
function getHisDesc(dict, code) {
    var di = dictItems(dict, '');
    for (var i = 0; i < di.rows.length; i++) { if (String(di.rows[i].Code) === String(code)) { return di.rows[i].Desc; } }
    return '';
}
function itemCount(dom) { var o = DB.Item[dom] || {}, n = 0; for (var k in o) { if (o.hasOwnProperty(k)) { n++; } } return n; }
function relStat(dom) {
    var o = DB.Item[dom] || {}, mapped = 0, rels = 0;
    for (var k in o) {
        if (!o.hasOwnProperty(k)) { continue; }
        var r = (DB.Rel[dom] || {})[k] || {}, c = 0;
        for (var h in r) { if (r.hasOwnProperty(h)) { c++; } }
        if (c > 0) { mapped++; rels += c; }
    }
    return { mapped: mapped, rels: rels };
}
function syncRelByHis(dom, item, hc) {
    DB.RelByHis[dom] = DB.RelByHis[dom] || {};
    DB.RelByHis[dom][hc] = DB.RelByHis[dom][hc] || {};
    var rel = (DB.Rel[dom][item] || {})[hc];
    if (!rel) { delete DB.RelByHis[dom][hc][item]; return; }
    var iname = ((DB.Item[dom] || {})[item] || {}).name || '';
    DB.RelByHis[dom][hc][item] = rel.desc + '^' + rel.flag + '^^^demo^^^^' + iname + '^';
}
function killRelByHisItem(dom, item) {
    var rbh = DB.RelByHis[dom] || {};
    for (var hc in rbh) { if (rbh.hasOwnProperty(hc) && rbh[hc]) { delete rbh[hc][item]; } }
}

/* ---------------- 种子数据 ---------------- */
(function seed() {
    DB.Platform['SY'] = { name: '通用数据采集标准', ver: 'v1.6', flag: 'Y', memo: '演示数据' };
    DB.Platform['HQMS'] = { name: 'HQMS医院质量监测系统', ver: '', flag: 'N', memo: '预留接入' };
    DB.Platform['YL6'] = { name: '六医联动平台', ver: '', flag: 'N', memo: '预留接入' };

    DB.HisDict['CT_LOC'] = { name: '科室字典', mode: 'S', flag: 'Y', memo: 'SQL 模式演示: FROM CT_Loc',
        sql: 'SELECT CTLOC_RowID AS id, CTLOC_Code AS code, CTLOC_Desc AS desc FROM CT_Loc ORDER BY CTLOC_Code' };
    DB.HisDict['CT_NATION'] = { name: '民族字典', mode: 'S', flag: 'Y', memo: 'SQL 模式演示: FROM CT_Nation',
        sql: 'SELECT CTNAT_Code AS code, CTNAT_Desc AS desc FROM CT_Nation' };
    DB.HisDict['CT_SEX'] = { name: '性别字典', mode: 'E', flag: 'Y', memo: '枚举模式演示',
        sql: '1=男\n2=女\n9=未说明' };

    window.HISDATA = {
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
        ]
    };

    for (var i = 0; i < MOCK.domains.length; i++) {
        var d = MOCK.domains[i];
        DB.Domain[d.code] = { name: d.name, his: MOCK.bound[d.code] || '', chap: d.chap, memo: '', flag: 'Y' };
        var its = MOCK.items[d.code] || [];
        DB.Item[d.code] = {};
        for (var j = 0; j < its.length; j++) { DB.Item[d.code][its[j].code] = { name: its[j].name, memo: its[j].memo }; }
    }
    /* 预置对照: 民族(01→汉族 02→蒙古族) / 就诊科室 */
    DB.Rel['GB/T 3304-1991'] = {
        '01': { '01': { desc: '汉族', flag: 'Y' } },
        '02': { '02': { desc: '蒙古族', flag: 'Y' } }
    };
    syncRelByHis('GB/T 3304-1991', '01', '01');
    syncRelByHis('GB/T 3304-1991', '02', '02');
    var its298 = DB.Item['LY.00.298'] ? Object.keys(DB.Item['LY.00.298']) : [];
    if (its298.length) {
        DB.Rel['LY.00.298'] = {};
        DB.Rel['LY.00.298'][its298[0]] = { '1001': { desc: '心血管内科', flag: 'Y' }, '1009': { desc: '急诊医学科', flag: 'N' } };
        syncRelByHis('LY.00.298', its298[0], '1001');
        syncRelByHis('LY.00.298', its298[0], '1009');
    }
})();

/* ---------------- $m 分发 ---------------- */
window.$m = function (data, cb) {
    setTimeout(function () {
        var m = data.MethodName, out = err('未知接口: ' + m), k, i;
        try {
            if (m === 'QueryPlatform') {
                var ap = [], kw = (data.Keyword || '').toUpperCase(), af = data.ActiveFlag || '';
                for (k in DB.Platform) {
                    if (!DB.Platform.hasOwnProperty(k)) { continue; }
                    var p = DB.Platform[k];
                    if (af && p.flag !== af) { continue; }
                    if (kw && k.toUpperCase().indexOf(kw) < 0 && p.name.toUpperCase().indexOf(kw) < 0) { continue; }
                    var dc = 0, ic = 0, rc = 0;
                    for (var d2 in DB.Domain) {
                        if (!DB.Domain.hasOwnProperty(d2)) { continue; }
                        dc++; ic += itemCount(d2); rc += relStat(d2).rels;
                    }
                    ap.push('{"PlatCode":"' + esc(k) + '","PlatName":"' + esc(p.name) + '","Version":"' + esc(p.ver) + '","ActiveFlag":"' + p.flag + '","Memo":"' + esc(p.memo) + '","DomainCnt":' + dc + ',"ItemCnt":' + ic + ',"RelCnt":' + rc + '}');
                }
                out = page(ap, data.Page, data.Rows);
            } else if (m === 'QueryDomain') {
                var ad = [], kw2 = data.Keyword || '', mf = data.MapFlag || '';
                for (k in DB.Domain) {
                    if (!DB.Domain.hasOwnProperty(k)) { continue; }
                    var dd = DB.Domain[k];
                    if (kw2 && k.indexOf(kw2) < 0 && dd.name.indexOf(kw2) < 0) { continue; }
                    if (mf === 'D' && !dd.his) { continue; }
                    if (mf === 'M' && dd.his) { continue; }
                    var st = relStat(k);
                    ad.push('{"DomainCode":"' + esc(k) + '","DomainName":"' + esc(dd.name) + '","Chapter":"' + esc(dd.chap) + '","HisDictCode":"' + esc(dd.his) + '","HisDictName":"' + esc((DB.HisDict[dd.his] || {}).name || '') + '","MapMode":"' + (dd.his ? 'D' : 'M') + '","ActiveFlag":"' + dd.flag + '","Memo":"' + esc(dd.memo) + '","ItemCnt":' + itemCount(k) + ',"MappedCnt":' + st.mapped + ',"RelCnt":' + st.rels + '}');
                }
                out = page(ad, data.Page, data.Rows);
            } else if (m === 'QueryDomainItem') {
                var dom = data.DomainCode, it = DB.Item[dom] || {}, ai = [], kwi = data.Keyword || '', mfi = data.MapFlag || '';
                for (k in it) {
                    if (!it.hasOwnProperty(k)) { continue; }
                    if (kwi && k.indexOf(kwi) < 0 && it[k].name.indexOf(kwi) < 0) { continue; }
                    var rr = (DB.Rel[dom] || {})[k] || {}, hs = [], ds = [], c = 0;
                    for (var h in rr) { if (rr.hasOwnProperty(h)) { c++; hs.push(h); ds.push(rr[h].desc); } }
                    if (mfi === 'Y' && c === 0) { continue; }
                    if (mfi === 'N' && c > 0) { continue; }
                    ai.push('{"ItemCode":"' + esc(k) + '","ItemName":"' + esc(it[k].name) + '","Memo":"' + esc(it[k].memo || '') + '","RelCnt":' + c + ',"RelCodes":"' + esc(hs.join('/')) + '","RelDescs":"' + esc(ds.join('/')) + '"}');
                }
                out = page(ai, data.Page, data.Rows);
            } else if (m === 'QueryItemRel') {
                var rl = (DB.Rel[data.DomainCode] || {})[data.ItemCode] || {}, ar = [];
                for (k in rl) {
                    if (!rl.hasOwnProperty(k)) { continue; }
                    ar.push('{"HisCode":"' + esc(k) + '","HisDesc":"' + esc(rl[k].desc) + '","ActiveFlag":"' + rl[k].flag + '","CreateUser":"demo","CreateTime":"2026-09-05 09:00","UpdateUser":"demo","UpdateTime":"' + nowStr() + '","Memo":""}');
                }
                out = '{"total":' + ar.length + ',"rows":[' + ar.join(',') + ']}';
            } else if (m === 'QueryHisDictItem') {
                var di = dictItems(data.DictCode, data.Keyword || '');
                var mfh = (data.MappedFilter || 'N').toUpperCase();
                var domH = data.DomainCode || '';
                var mappedSet = {};
                if (domH) {
                    var rm = DB.Rel[domH] || {};
                    for (var it2 in rm) {
                        if (!rm.hasOwnProperty(it2)) { continue; }
                        for (var hc2 in rm[it2]) { if (rm[it2].hasOwnProperty(hc2)) { mappedSet[hc2] = it2; } }
                    }
                }
                var ah = [], mappedCnt = 0;
                for (var mk in mappedSet) { if (mappedSet.hasOwnProperty(mk)) { mappedCnt++; } }
                for (i = 0; i < di.rows.length; i++) {
                    var code = String(di.rows[i].Code), isM = mappedSet[code] ? 1 : 0;
                    if (mfh === 'N' && isM) { continue; }
                    if (mfh === 'M' && !isM) { continue; }
                    ah.push('{"Code":"' + esc(code) + '","Desc":"' + esc(di.rows[i].Desc) + '","isMapped":' + isM + '}');
                }
                out = '{"success":true,"msg":"' + esc(di.msg || '') + '","mappedCnt":' + mappedCnt + ',' + page(ah, data.Page, data.Rows).substr(1);
            } else if (m === 'QueryRel') {
                var arel = [];
                var domF = data.DomainCode || '', ikw = data.ItemKeyword || '', hkw = data.HisKeyword || '', afR = data.ActiveFlag || '';
                for (var d3 in DB.Rel) {
                    if (!DB.Rel.hasOwnProperty(d3)) { continue; }
                    if (domF && d3 !== domF) { continue; }
                    var dd3 = DB.Domain[d3] || {};
                    for (var it3 in DB.Rel[d3]) {
                        if (!DB.Rel[d3].hasOwnProperty(it3)) { continue; }
                        var iname3 = ((DB.Item[d3] || {})[it3] || {}).name || '';
                        if (ikw && it3.indexOf(ikw) < 0 && iname3.indexOf(ikw) < 0) { continue; }
                        for (var hc3 in DB.Rel[d3][it3]) {
                            if (!DB.Rel[d3][it3].hasOwnProperty(hc3)) { continue; }
                            var o3 = DB.Rel[d3][it3][hc3];
                            if (hkw && hc3.indexOf(hkw) < 0 && o3.desc.indexOf(hkw) < 0) { continue; }
                            if (afR && o3.flag !== afR) { continue; }
                            arel.push('{"PlatCode":"' + g + '","DomainCode":"' + esc(d3) + '","DomainName":"' + esc(dd3.name || '') + '","ItemCode":"' + esc(it3) + '","ItemName":"' + esc(iname3) + '","HisCode":"' + esc(hc3) + '","HisDesc":"' + esc(o3.desc) + '","ActiveFlag":"' + o3.flag + '","CreateUser":"demo","CreateTime":"2026-09-05 09:00","UpdateUser":"demo","UpdateTime":"' + nowStr() + '","Memo":"","HisDictCode":"' + esc(dd3.his || '') + '","HisDictName":"' + esc((DB.HisDict[dd3.his] || {}).name || '') + '","MapMode":"' + (dd3.his ? 'D' : 'M') + '"}');
                        }
                    }
                }
                out = page(arel, data.Page, data.Rows);
            } else if (m === 'QueryHisDict') {
                var adct = [], kwd = data.Keyword || '', afd = data.ActiveFlag || '';
                for (k in DB.HisDict) {
                    if (!DB.HisDict.hasOwnProperty(k)) { continue; }
                    var v6 = DB.HisDict[k];
                    if (afd && v6.flag !== afd) { continue; }
                    if (kwd && k.indexOf(kwd) < 0 && v6.name.indexOf(kwd) < 0) { continue; }
                    adct.push('{"DictCode":"' + esc(k) + '","DictName":"' + esc(v6.name) + '","Type":"' + v6.mode + '","ActiveFlag":"' + v6.flag + '","Memo":"' + esc(v6.memo || '') + '","CreateUser":"demo","CreateTime":"2026-09-05 09:00","UpdateUser":"demo","UpdateTime":"' + nowStr() + '"}');
                }
                out = page(adct, data.Page, data.Rows);
            } else if (m === 'SaveDictRel') {
                var dom4 = data.DomainCode, itm4 = data.ItemCode;
                var codes4 = (data.HisCodes || '').split('^'), add4 = 0, skip4 = 0, conf = [];
                DB.Rel[dom4] = DB.Rel[dom4] || {};
                DB.Rel[dom4][itm4] = DB.Rel[dom4][itm4] || {};
                var hisDict4 = (DB.Domain[dom4] || {}).his || '';
                for (i = 0; i < codes4.length; i++) {
                    var hc4 = codes4[i];
                    if (!hc4) { continue; }
                    var owner = null;
                    var rm4 = DB.Rel[dom4] || {};
                    for (var it4 in rm4) {
                        if (rm4.hasOwnProperty(it4) && rm4[it4] && rm4[it4][hc4] && it4 !== itm4) { owner = it4; break; }
                    }
                    if (owner) { skip4++; conf.push(hc4 + '(已被条目' + owner + '对照)'); continue; }
                    var desc4 = hisDict4 ? getHisDesc(hisDict4, hc4) : hc4;
                    DB.Rel[dom4][itm4][hc4] = { desc: desc4 || hc4, flag: 'Y' };
                    syncRelByHis(dom4, itm4, hc4);
                    add4++;
                }
                var msg4 = '保存成功' + add4 + '条';
                if (skip4 > 0) { msg4 += ', 跳过' + skip4 + '条: ' + conf.join(';'); }
                out = '{"success":true,"add":' + add4 + ',"skip":' + skip4 + ',"msg":"' + esc(msg4) + '"}';
            } else if (m === 'UpdateRel') {
                var o5 = ((DB.Rel[data.DomainCode] || {})[data.ItemCode] || {})[data.HisCode];
                if (!o5) { out = err('对照记录不存在'); }
                else {
                    o5.desc = data.HisDesc; o5.flag = data.ActiveFlag;
                    syncRelByHis(data.DomainCode, data.ItemCode, data.HisCode);
                    out = ok('保存成功');
                }
            } else if (m === 'DeleteRel') {
                var rm5 = (DB.Rel[data.DomainCode] || {})[data.ItemCode];
                if (!rm5 || !rm5[data.HisCode]) { out = err('对照记录不存在'); }
                else {
                    delete rm5[data.HisCode];
                    syncRelByHis(data.DomainCode, data.ItemCode, data.HisCode);
                    out = ok('删除成功');
                }
            } else if (m === 'ClearRel') {
                var rl6 = (DB.Rel[data.DomainCode] || {})[data.ItemCode] || {}, n6 = 0;
                for (k in rl6) { if (rl6.hasOwnProperty(k)) { n6++; } }
                DB.Rel[data.DomainCode][data.ItemCode] = {};
                killRelByHisItem(data.DomainCode, data.ItemCode);
                out = '{"success":true,"msg":"已清空' + n6 + '条对照"}';
            } else if (m === 'ClearRelBatch') {
                var items7 = (data.ItemList || '').split('^'), nR7 = 0, nI7 = 0;
                DB.Rel[data.DomainCode] = DB.Rel[data.DomainCode] || {};
                for (i = 0; i < items7.length; i++) {
                    var ic7 = items7[i];
                    if (!ic7) { continue; }
                    var rc7 = DB.Rel[data.DomainCode][ic7] || {};
                    for (k in rc7) { if (rc7.hasOwnProperty(k)) { nR7++; } }
                    DB.Rel[data.DomainCode][ic7] = {};
                    killRelByHisItem(data.DomainCode, ic7);
                    nI7++;
                }
                out = '{"success":true,"items":' + nI7 + ',"rels":' + nR7 + ',"msg":"已处理' + nI7 + '个条目,共清空' + nR7 + '条对照"}';
            } else if (m === 'RefreshRelDesc') {
                var hisD8 = (DB.Domain[data.DomainCode] || {}).his || '';
                if (!hisD8) { out = err('该值域未维护HIS字典表,无需刷新'); }
                else {
                    var upd8 = 0, miss8 = 0;
                    var rm8 = DB.Rel[data.DomainCode] || {};
                    for (var it8 in rm8) {
                        if (!rm8.hasOwnProperty(it8)) { continue; }
                        for (var hc8 in rm8[it8]) {
                            if (!rm8[it8].hasOwnProperty(hc8)) { continue; }
                            var d8 = getHisDesc(hisD8, hc8);
                            if (d8 === '') { miss8++; } else { rm8[it8][hc8].desc = d8; syncRelByHis(data.DomainCode, it8, hc8); upd8++; }
                        }
                    }
                    out = '{"success":true,"upd":' + upd8 + ',"miss":' + miss8 + ',"msg":"刷新' + upd8 + '条,字典中已不存在' + miss8 + '条"}';
                }
            } else if (m === 'SaveDomainHisDict') {
                if (!DB.Domain[data.DomainCode]) { out = err('值域不存在'); }
                else {
                    var oldH = DB.Domain[data.DomainCode].his || '';
                    var newH = data.HisDictCode || '';
                    if (newH && !DB.HisDict[newH]) { out = err('HIS字典表[' + newH + ']未注册'); }
                    else {
                        var changed = (oldH !== newH), cleared = 0;
                        DB.Domain[data.DomainCode].his = newH;
                        if (changed && data.ClearMappings && data.ClearMappings !== 'N') {
                            var rm9 = DB.Rel[data.DomainCode] || {};
                            for (var it9 in rm9) {
                                if (!rm9.hasOwnProperty(it9)) { continue; }
                                for (var hc9 in rm9[it9]) { if (rm9[it9].hasOwnProperty(hc9)) { cleared++; } }
                                rm9[it9] = {};
                            }
                            killRelByHisItem(data.DomainCode, '');
                            var rbh9 = DB.RelByHis[data.DomainCode] || {};
                            for (var hb9 in rbh9) { if (rbh9.hasOwnProperty(hb9)) { delete rbh9[hb9]; } }
                        }
                        out = '{"success":true,"changed":' + changed + ',"cleared":' + cleared + ',"msg":"保存成功"}';
                    }
                }
            } else if (m === 'SaveHisDict') {
                if (!data.DictCode) { out = err('字典代码不能为空'); }
                else if (!data.DictName) { out = err('字典名称不能为空'); }
                else {
                    var tp = (data.Type || 'S').toUpperCase();
                    if (tp !== 'S' && tp !== 'E') { out = err('类型只能为S(SQL)或E(枚举)'); }
                    else if (tp === 'S' && !data.SqlText) { out = err('SQL语句不能为空'); }
                    else if (tp === 'E' && !data.EnumText) { out = err('枚举内容不能为空'); }
                    else {
                        DB.HisDict[data.DictCode] = {
                            name: data.DictName, mode: tp, flag: data.ActiveFlag || 'N',
                            memo: data.Memo || '', sql: tp === 'S' ? data.SqlText : data.EnumText
                        };
                        out = ok('保存成功');
                    }
                }
            } else if (m === 'DeleteHisDict') {
                var boundBy = [];
                for (k in DB.Domain) { if (DB.Domain.hasOwnProperty(k) && DB.Domain[k] && DB.Domain[k].his === data.DictCode) { boundBy.push(k); } }
                if (boundBy.length) { out = err('该字典表已被值域[' + boundBy.join(',') + ']引用,不能删除'); }
                else { delete DB.HisDict[data.DictCode]; out = ok('删除成功'); }
            } else if (m === 'GetHisDict') {
                var hd10 = DB.HisDict[data.DictCode] || {};
                var sql10 = hd10.mode === 'S' ? (hd10.sql || '') : '';
                var enum10 = hd10.mode === 'E' ? (hd10.sql || '') : '';
                out = '{"success":' + (DB.HisDict[data.DictCode] ? 'true' : 'false') + ',"DictCode":"' + esc(data.DictCode) + '","DictName":"' + esc(hd10.name || '') + '","Type":"' + (hd10.mode || 'S') + '","ActiveFlag":"' + (hd10.flag || 'N') + '","Memo":"' + esc(hd10.memo || '') + '","SqlText":"' + esc(sql10) + '","EnumText":"' + esc(enum10) + '"}';
            } else if (m === 'ProbeHisDict') {
                var hd11 = DB.HisDict[data.DictCode];
                if (!hd11) { out = err('字典表未注册'); }
                else {
                    var di11 = dictItems(data.DictCode, ''), smp = [];
                    for (i = 0; i < di11.rows.length && i < 5; i++) {
                        var raw = String(di11.rows[i].Code) + '^' + String(di11.rows[i].Desc);
                        smp.push('{"id":"' + esc(di11.rows[i].Code) + '","code":"' + esc(di11.rows[i].Code) + '","desc":"' + esc(di11.rows[i].Desc) + '","raw":"' + esc(raw) + '"}');
                    }
                    var msg11 = '';
                    if (!smp.length) { msg11 = hd11.mode === 'S' ? 'SQL未返回数据(演示环境: 请检查 FROM 表名)' : '枚举字典暂无数据'; }
                    out = '{"success":true,"DictCode":"' + esc(data.DictCode) + '","Type":"' + hd11.mode + '","samples":[' + smp.join(',') + '],"msg":"' + esc(msg11) + '"}';
                }
            } else if (m === 'QueryRelCoverage') {
                var dict12 = data.DictCode || '';
                var hd12 = DB.HisDict[dict12];
                if (!dict12) { out = err('请选择 HIS 字典'); }
                else if (!hd12) { out = err('字典表未注册'); }
                else {
                    var dom12 = data.DomainCode || '';
                    /* 值域内已对照集合: hc -> {item:1} */
                    var covSet = {};
                    var pushCov = function (d, code) {
                        var rmC = DB.Rel[d] || {};
                        for (var itC in rmC) {
                            if (!rmC.hasOwnProperty(itC) || !rmC[itC]) { continue; }
                            if (rmC[itC][code]) { covSet[code] = covSet[code] || {}; covSet[code][itC] = d; }
                        }
                    };
                    if (dom12) { pushCov(dom12, null); }  /* placeholder, replaced below */
                    covSet = {};
                    var doms12 = dom12 ? [dom12] : Object.keys(DB.Domain);
                    var allCodes = {};
                    for (i = 0; i < doms12.length; i++) {
                        var rm12 = DB.Rel[doms12[i]] || {};
                        for (var it12 in rm12) {
                            if (!rm12.hasOwnProperty(it12) || !rm12[it12]) { continue; }
                            for (var hc12 in rm12[it12]) {
                                if (!rm12[it12].hasOwnProperty(hc12)) { continue; }
                                allCodes[hc12] = allCodes[hc12] || {};
                                allCodes[hc12][it12] = doms12[i];
                            }
                        }
                    }
                    var di12 = dictItems(dict12, '');
                    var acov = [], mapped12 = 0, unmapped12 = 0;
                    for (i = 0; i < di12.rows.length; i++) {
                        var code12 = String(di12.rows[i].Code);
                        var owners = allCodes[code12] || {};
                        var isM12 = false, icL = '', inL = '', cnt12 = 0;
                        for (var ow in owners) {
                            if (!owners.hasOwnProperty(ow)) { continue; }
                            isM12 = true; cnt12++;
                            var iN12 = ((DB.Item[owners[ow]] || {})[ow] || {}).name || '';
                            if (cnt12 > 1) { icL += ' / '; inL += ' / '; }
                            icL += ow; inL += iN12;
                            if (cnt12 >= 5) { break; }
                        }
                        if (isM12) { mapped12++; } else { unmapped12++; }
                        acov.push('{"HisCode":"' + esc(code12) + '","HisDesc":"' + esc(di12.rows[i].Desc) + '","MappedFlag":"' + (isM12 ? 'Y' : 'N') + '","ItemCode":"' + esc(icL) + '","ItemName":"' + esc(inL) + '","ItemCount":' + cnt12 + '}');
                    }
                    out = '{"success":true,"PlatCode":"' + esc(data.PlatCode || g) + '","DomainCode":"' + esc(dom12) + '","DictCode":"' + esc(dict12) + '","DictName":"' + esc(hd12.name) + '","total":' + acov.length + ',"mapped":' + mapped12 + ',"unmapped":' + unmapped12 + ',"rows":[' + acov.join(',') + ']}';
                }
            } else if (m === 'SetRelFlagBatch') {
                var ids13 = (data.IdList || '').split('^'), n13 = 0;
                for (i = 0; i < ids13.length; i++) {
                    var p13 = ids13[i].split('|');
                    var o13 = (DB.Rel[p13[0]] || {})[p13[1]];
                    if (o13 && o13[p13[2]]) { o13[p13[2]].flag = data.ActiveFlag; n13++; }
                }
                out = '{"success":true,"ok":' + n13 + ',"err":0,"msg":"共处理' + n13 + '条"}';
            } else if (m === 'DeleteRelBatch') {
                var ids14 = (data.IdList || '').split('^'), n14 = 0;
                for (i = 0; i < ids14.length; i++) {
                    var p14 = ids14[i].split('|');
                    var o14 = (DB.Rel[p14[0]] || {})[p14[1]];
                    if (o14 && o14[p14[2]]) { delete o14[p14[2]]; n14++; }
                }
                out = '{"success":true,"ok":' + n14 + ',"err":0,"msg":"删除' + n14 + '条"}';
            } else if (m === 'SavePlatform') {
                if (!data.PlatCode) { out = err('平台代码不能为空'); }
                else if (!data.PlatName) { out = err('平台名称不能为空'); }
                else { DB.Platform[data.PlatCode] = { name: data.PlatName, ver: data.Version, flag: data.ActiveFlag, memo: data.Memo }; out = ok('保存成功'); }
            } else if (m === 'DeletePlatform') {
                if (!DB.Platform[data.PlatCode]) { out = err('平台不存在'); }
                else {
                    delete DB.Platform[data.PlatCode];
                    DB.Domain = {}; DB.Item = {}; DB.Rel = {}; DB.RelByHis = {};
                    out = ok('删除成功');
                }
            } else if (m === 'ExportRel') {
                var csv15 = '平台代码,值域代码,值域名称,采集代码,采集名称,HIS代码,HIS描述,状态,录入方式,修改人,修改时间,备注\n';
                var domF15 = data.DomainCode || '';
                for (var d15 in DB.Rel) {
                    if (!DB.Rel.hasOwnProperty(d15)) { continue; }
                    if (domF15 && d15 !== domF15) { continue; }
                    var dd15 = DB.Domain[d15] || {};
                    for (var it15 in DB.Rel[d15]) {
                        if (!DB.Rel[d15].hasOwnProperty(it15)) { continue; }
                        var in15 = ((DB.Item[d15] || {})[it15] || {}).name || '';
                        for (var hc15 in DB.Rel[d15][it15]) {
                            if (!DB.Rel[d15][it15].hasOwnProperty(hc15)) { continue; }
                            var o15 = DB.Rel[d15][it15][hc15];
                            csv15 += [g, d15, dd15.name || '', it15, in15, hc15, o15.desc, o15.flag, dd15.his ? '字典对照' : '手工录入', 'demo', nowStr(), ''].join(',') + '\n';
                        }
                    }
                }
                out = csv15;
            } else if (m === 'ImportDomainRows') {
                var plat16 = data.PlatCode || g;
                if (!DB.Platform[plat16]) { out = err('平台不存在,请先维护平台'); }
                else {
                    var arr16 = null;
                    try { arr16 = JSON.parse(data.JsonText || '[]'); } catch (e16) { arr16 = null; }
                    if (!arr16) { out = err('JSON解析失败'); }
                    else {
                        var nI16 = 0, nD16 = 0;
                        if (String(data.ClearFlag || '').toUpperCase() === 'Y') {
                            DB.Item = {}; DB.Rel = {}; DB.RelByHis = {};
                            for (var c16 in DB.Domain) { if (DB.Domain.hasOwnProperty(c16)) { DB.Domain[c16].his = ''; } }
                        }
                        for (i = 0; i < arr16.length; i++) {
                            var ro16 = arr16[i] || {};
                            var dc16 = String(ro16.domCode == null ? '' : ro16.domCode).replace(/^\ufeff/, '').replace(/^\s+|\s+$/g, '');
                            if (!dc16) { continue; }
                            if (!DB.Domain[dc16]) { DB.Domain[dc16] = { name: String(ro16.domName || dc16), his: '', chap: '', memo: '', flag: 'Y' }; nD16++; }
                            else if (ro16.domName) { DB.Domain[dc16].name = String(ro16.domName); }
                            if (ro16.itemCode !== '' && ro16.itemCode != null) {
                                DB.Item[dc16] = DB.Item[dc16] || {};
                                DB.Item[dc16][String(ro16.itemCode)] = { name: String(ro16.itemName || ''), memo: String(ro16.memo || '') };
                                nI16++;
                            }
                        }
                        out = '{"success":true,"item":' + nI16 + ',"domain":' + nD16 + ',"err":0,"msg":"导入完成: 值域' + nD16 + '个, 条目' + nI16 + '条"}';
                    }
                }
            } else if (m === 'ImportDomainFile') {
                var fp17 = String(data.FilePath || ''), plat17 = data.PlatCode || g;
                if (!DB.Platform[plat17]) { out = err('平台不存在,请先维护平台'); }
                else if (!fp17) { out = err('文件路径不能为空'); }
                else if (/notfound|不存在/i.test(fp17)) { out = err('文件打开失败'); }
                else {
                    var demo17 = [
                        ['DEMO.FILE.001', '服务器路径导入演示值域', '1', '演示条目一', ''],
                        ['DEMO.FILE.001', '服务器路径导入演示值域', '2', '演示条目二', ''],
                        ['DEMO.FILE.001', '服务器路径导入演示值域', '3', '演示条目三', ''],
                        ['DEMO.FILE.002', '路径导入第二个值域', 'A', '示例A', '']
                    ];
                    var nF17 = 0, nD17 = 0;
                    if (String(data.ClearFlag || '').toUpperCase() === 'Y') {
                        DB.Item = {}; DB.Rel = {}; DB.RelByHis = {};
                        for (var c17 in DB.Domain) { if (DB.Domain.hasOwnProperty(c17)) { DB.Domain[c17].his = ''; } }
                    }
                    for (i = 0; i < demo17.length; i++) {
                        var r17 = demo17[i];
                        if (!DB.Domain[r17[0]]) { DB.Domain[r17[0]] = { name: r17[1], his: '', chap: '', memo: '', flag: 'Y' }; nD17++; }
                        DB.Item[r17[0]] = DB.Item[r17[0]] || {};
                        DB.Item[r17[0]][r17[2]] = { name: r17[3], memo: r17[4] };
                        nF17++;
                    }
                    out = '{"success":true,"item":' + nF17 + ',"domain":' + nD17 + ',"msg":"（预览模拟）已读取 ' + esc(fp17) + ' : 值域' + nD17 + '个, 条目' + nF17 + '条"}';
                }
            }
        } catch (ex) {
            out = err('模拟后端异常: ' + (ex && ex.message));
        }
        if (cb) { cb(out); }
    }, 30);
};

/* 预览提示条 */
$(function () {
    $('.appbar .sub').text('离线预览 · 内置演示数据(305 个真实值域 + 模拟 HIS 字典), 正式部署请使用 sanyidictmap.csp / sanyidictmap.js / web.YZSY.DHCSYDictMap.cls');
});
})();
"""

BANNER = """
<div style="background:#fff7e6;border-bottom:1px solid #ffd591;color:#ad6800;padding:5px 16px;font-size:12px">
<b>离线预览</b>：本页为界面效果演示，数据为内置样例，后端交互由本地脚本模拟，不会读写任何数据库。
</div>
"""


def build_preview():
    csp = open(os.path.join(SRC, "sanyidictmap.csp"), encoding="utf-8-sig").read()
    csp = csp.split("</csp:method>", 1)[1]
    csp = csp.replace("</csp:content>", "").replace("<EXTHEALTH:HEAD></EXTHEALTH:HEAD>", "")
    csp = csp.replace('src="../scripts/sanyidictmap.js"', 'src="sanyidictmap.js"')

    jq = ('<script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>\n'
          '<script>if (typeof jQuery === "undefined") { document.write(\'<script src="jquery-1.11.3.min.js"><\\/script>\'); }</script>\n')
    csp = csp.replace("<head>", "<head>\n" + jq, 1)

    data = preview_data()
    mock = MOCK_JS.replace("__MOCK_JSON__", json.dumps(data, ensure_ascii=False))
    if "<script" not in mock.split("\n", 1)[0]:
        mock = "<script>\n" + mock + "\n</script>"
    idx = csp.rindex("</body>")
    out = csp[:idx] + mock + "\n" + csp[idx:]
    # 预览提示条插到顶栏上方
    out = out.replace('<div id="app">', '<div id="app">' + BANNER, 1)
    with open(OUT_HTML, "w", encoding="utf-8-sig", newline="") as f:
        f.write(out)
    return len(out.encode("utf-8")), len(data["domains"]), sum(len(v) for v in data["items"].values())


if __name__ == "__main__":
    size, nd, ni = build_preview()
    print("预览HTML = %.1f KB, 值域 %d 个, 嵌入条目 %d 条 → %s" % (size / 1024.0, nd, ni, OUT_HTML))
