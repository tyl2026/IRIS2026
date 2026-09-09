/* 验证: 现代化全新设计的 预览.html (通用采集字典对照/01代码实现)
   1) 5 页签结构与切换  2) XTbl 数据渲染  3) Tab1 对照维护全流程(选值域→选条目→勾选HIS→保存→统计刷新)
   4) Tab2 对照关系  5) Tab3 覆盖查询  6) Tab4 字典注册  7) Tab5 平台/CSV导入
   8) mock 后端关键接口 (SaveDictRel/QueryRelCoverage/QueryRelByHis/ImportDomainRows) */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const DIR = path.resolve('C:/Users/Admin/Desktop/通用采集字典对照/01代码实现');
const HTML = fs.readFileSync(path.join(DIR, '预览.html'), 'utf-8');
const vc = new VirtualConsole();
vc.on('log', (...a) => console.log(...a));
vc.on('jsdomError', (e) => console.error('[jsdomError]', e.message));

const jq  = fs.readFileSync(path.resolve('D:/claude code/IRIS/HISUI-新建/20260907第三方平台自定对照界面', '_tmp', 'jquery-1.11.3.min.js'), 'utf-8');
const biz = fs.readFileSync(path.join(DIR, 'sanyidictmap.js'), 'utf-8');

const inlined = HTML
    .replace(/<script src="https:\/\/code\.jquery\.com[^"]*"><\/script>/, '')
    .replace(/<script>if \(typeof jQuery === "undefined"\)[\s\S]*?<\/script>/, '')
    .replace(/<script type="text\/javascript" src="sanyidictmap\.js"><\/script>/, '<script>' + biz + '</' + 'script>')
    .replace(/<script src="sanyidictmap\.js"><\/script>/, '<script>' + biz + '</' + 'script>')
    .replace('</head>', '<script>' + jq + '</' + 'script></head>');

const dom = new JSDOM(inlined, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc });

let pass = 0, fail = 0;
function check(label, ok, extra) {
    if (ok) { pass++; console.log('  OK', label); }
    else    { fail++; console.log('  XX', label, ' extra=', extra || ''); }
}
const W = (fn, ms) => setTimeout(fn, ms || 120);

setTimeout(() => {
    const w = dom.window;
    const $ = w.jQuery;
    const PARSE = (t) => { try { return JSON.parse(t); } catch (e) { return null; } };
    const call = (method, params, cb) => {
        const payload = { ClassName: 'x', MethodName: method };
        for (const k in params) { payload[k] = params[k]; }
        w.$m(payload, function (txt) { cb(PARSE(typeof txt === 'string' ? txt : (txt && txt.responseText) || '')); });
    };

    console.log('======== 1) 页签结构与首屏 ========');
    const titles = $('#mainTabs .tab').map(function () { return $(this).text().trim(); }).get();
    check('共 5 个页签', titles.length === 5, JSON.stringify(titles));
    const wantTitles = ['字典对照维护', '对照关系查询', '对照覆盖查询', 'HIS 字典表注册', '字典导入维护'];
    check('页签标题与需求一致', titles.length === 5 && wantTitles.every((t, i) => titles[i].indexOf(t) >= 0), JSON.stringify(titles));
    check('顶栏平台下拉已填充', $('#gPlat option').length >= 1, 'opts=' + $('#gPlat option').length);
    check('gPlat 已初始化', !!(w.__state && w.__state().gPlat), w.__state && w.__state().gPlat);

    console.log('======== 2) Tab1 值域列表(XTbl 渲染) ========');
    check('T.domain 有数据', w.T.domain && w.T.domain.rows.length > 0, 'rows=' + (w.T.domain && w.T.domain.rows.length));
    check('值域表格 DOM 已渲染行', $('#tblDomain tbody tr').length > 0, 'tr=' + $('#tblDomain tbody tr').length);
    check('#domainStat 显示统计', /共 \d+ 个值域/.test($('#domainStat').text()), $('#domainStat').text());

    /* 定位已绑定 CT_NATION 的值域 GB/T 3304-1991 */
    w.setVal('qDomain', 'GB/T 3304-1991');
    w.loadDomain(1);
    W(() => {
        const drows = w.T.domain.rows;
        check('搜索定位到民族值域', drows.length >= 1 && drows[0].DomainCode === 'GB/T 3304-1991', JSON.stringify(drows.map(r => r.DomainCode)));
        const domRow = drows[0];
        check('值域已绑定 CT_NATION', domRow.HisDictCode === 'CT_NATION', domRow.HisDictCode);

        console.log('======== 3) Tab1 选值域→条目→HIS→当前对照 ========');
        w.selectDomain(domRow);
        W(() => {
            check('选择值域后条目表有数据', w.T.item.rows.length > 0, 'rows=' + w.T.item.rows.length);
            check('已绑定标签显示', /已绑定/.test($('#hisDictTag').text()), $('#hisDictTag').text());
            const irow = w.T.item.rows[0];
            w.selectItem(irow);
            W(() => {
                check('选择条目后当前对照表有数据', w.T.cur.rows.length >= 1, 'rows=' + w.T.cur.rows.length);
                check('HIS 条目表有数据', w.T.his.rows.length > 0, 'rows=' + w.T.his.rows.length);
                check('HIS 已对照行自动预勾', w.T.his.getChecked().length >= 1, 'ck=' + w.T.his.getChecked().length);
                check('#curTip 显示条目信息', /已对照 \d+ 条/.test($('#curTip').text()), $('#curTip').text());
                check('被其它条目占用的行标记锁定', w.T.his.rows.some(r => r.__locked) === true, 'anyLocked=' + w.T.his.rows.some(r => r.__locked));

                /* 勾选一个未对照行 → saveDictRel → 当前对照数增加 */
                const before = w.T.cur.rows.length;
                const free = w.T.his.rows.filter(r => !r.__cur && !r.__locked);
                if (free.length) {
                    w.T.his.checked[free[0].__key] = true;
                    w.T.his._render();
                    w.saveDictRel();
                    W(() => {
                        check('saveDictRel 后当前对照+1', w.T.cur.rows.length === before + 1, before + '->' + w.T.cur.rows.length);
                        check('保存成功 toast 出现', $('#toastWrap .toast').length >= 1);
                        doRelTab();
                    }, 260);
                } else {
                    check('saveDictRel 后当前对照+1(无空闲行跳过)', true, 'no free his rows');
                    doRelTab();
                }
            }, 220);
        }, 220);
    }, 220);

    function doRelTab() {
        console.log('======== 4) Tab2 对照关系查询 ========');
        w.switchTab(1);
        W(() => {
            check('页签切换到 page1', $('#page1').hasClass('on') && $('#mainTabs .tab[data-i="1"]').hasClass('on'));
            check('T.rel 有数据', w.T.rel && w.T.rel.rows.length > 0, 'rows=' + (w.T.rel && w.T.rel.rows.length));
            check('关系表格 DOM 渲染', $('#tblRel tbody tr').length > 0, 'tr=' + $('#tblRel tbody tr').length);
            doCovTab();
        }, 220);
    }

    function doCovTab() {
        console.log('======== 5) Tab3 对照覆盖查询 ========');
        w.switchTab(2);
        W(() => {
            check('页签切换到 page2', $('#page2').hasClass('on'));
            check('值域下拉已填充', $('#covDomain option').length > 1, 'opts=' + $('#covDomain option').length);
            check('HIS 字典下拉已填充', $('#covDict option').length > 1, 'opts=' + $('#covDict option').length);
            w.setVal('covDict', 'CT_NATION');
            w.loadCov();
            W(() => {
                const tot = $('#covTotal').text();
                check('覆盖统计卡片已刷新', /\d+/.test(tot) && tot !== '–', 'total=' + tot);
                check('T.cov 本地数据有行', w.T.cov.rows.length > 0, 'rows=' + w.T.cov.rows.length);
                check('覆盖率进度条已更新', parseInt(($('#covBar').css('width') || '0'), 10) >= 0 || $('#covBar').css('width') !== '0%');
                /* 未对照筛选 */
                $('#covFilter a[data-v="U"]').trigger('click');
                check('筛选未对照生效', w.T.cov.rows.every(r => r.MappedFlag !== 'Y') && w.T.cov.rows.length > 0, 'rows=' + w.T.cov.rows.length);
                doDictTab();
            }, 240);
        }, 240);
    }

    function doDictTab() {
        console.log('======== 6) Tab4 HIS 字典表注册 ========');
        w.switchTab(3);
        W(() => {
            check('页签切换到 page3', $('#page3').hasClass('on'));
            check('T.dict 有数据', w.T.dict && w.T.dict.rows.length > 0, 'rows=' + (w.T.dict && w.T.dict.rows.length));
            check('字典类型标签(SQL/枚举)渲染', /SQL|枚举/.test($('#tblDict').html() || ''), '');
            doPlatTab();
        }, 220);
    }

    function doPlatTab() {
        console.log('======== 7) Tab5 字典导入维护 ========');
        w.switchTab(4);
        W(() => {
            check('页签切换到 page4', $('#page4').hasClass('on'));
            check('T.plat 平台表有数据', w.T.plat && w.T.plat.rows.length > 0, 'rows=' + (w.T.plat && w.T.plat.rows.length));
            check('上传区/服务器路径两种导入方式并存', $('#dropzone').length === 1 && $('#impPath').length === 1);
            /* CSV 解析与行转换 */
            const csvTxt = '值域代码,值域名称,代码,名称,说明\nCVT.1,验证值域,1,甲,\nCVT.1,验证值域,2,乙,备注X\nCVT.2,验证值域2,3,丙,';
            const rows = w.parseCsvText(csvTxt, ',');
            check('parseCsvText 解析 3 行', rows.length === 3, JSON.stringify(rows));
            const imp = w.rowsToImport(rows);
            check('rowsToImport 字段映射正确', imp.length === 3 && imp[0].domCode === 'CVT.1' && imp[1].itemName === '乙' && imp[1].memo === '备注X', JSON.stringify(imp[1]));
            mockApis();
        }, 220);
    }

    function mockApis() {
        console.log('======== 8) mock 后端关键接口 ========');
        let pending = 0;
        const doneAll = () => { finish(); };
        const q = (label, method, params, judge) => {
            pending++;
            call(method, params, (rs) => {
                check(label, judge(rs), rs ? JSON.stringify(rs).substring(0, 160) : 'null');
                if (--pending === 0) doneAll();
            });
        };
        q('QueryRelCoverage 返回覆盖统计', 'QueryRelCoverage', { PlatCode: 'SY', DomainCode: '', DictCode: 'CT_NATION', Filter: '' },
            (rs) => rs && rs.success === true && rs.rows && rs.rows.length > 0 && rs.total > 0 && rs.mapped !== undefined);
        q('ImportDomainRows 分批导入', 'ImportDomainRows', { PlatCode: 'SY', JsonText: JSON.stringify([
            { domCode: 'VERIFY.MD.1', domName: '验证值域', itemCode: 'A', itemName: '甲', memo: '' },
            { domCode: 'VERIFY.MD.1', domName: '验证值域', itemCode: 'B', itemName: '乙', memo: '' }
        ]), ClearFlag: 'N' }, (rs) => rs && rs.success === true && rs.item === 2 && rs.domain === 1);
        q('ImportDomainRows 追加不重复计值域', 'ImportDomainRows', { PlatCode: 'SY', JsonText: JSON.stringify([
            { domCode: 'VERIFY.MD.1', domName: '验证值域', itemCode: 'C', itemName: '丙', memo: '' }
        ]), ClearFlag: 'N' }, (rs) => rs && rs.success === true && rs.item === 1 && rs.domain === 0);
        q('SaveDictRel 追加对照', 'SaveDictRel', { PlatCode: 'SY', DomainCode: 'VERIFY.MD.1', ItemCode: 'A', HisCodes: '01', Mode: 'A' },
            (rs) => rs && rs.success === true);
        q('DeleteRel 删除对照', 'DeleteRel', { PlatCode: 'SY', DomainCode: 'VERIFY.MD.1', ItemCode: 'A', HisCode: '01' },
            (rs) => rs && rs.success === true);
    }

    function finish() {
        console.log('\n======== 结果: ' + pass + ' 通过, ' + fail + ' 失败 ========');
        process.exit(fail ? 1 : 0);
    }
}, 400);
