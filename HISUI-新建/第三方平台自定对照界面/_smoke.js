/**
 * 离线预览页冒烟测试 (jsdom)
 * 覆盖新需求场景:
 *  1) 已绑定值域 → 词典对照、勾选、保存、查询
 *  2) 未绑定值域 → 引导面板出现、就地新增字典（枚举/ SQL）、绑定、回链
 *  3) 绑定已有字典 流程
 *  4) Tab3 字典注册 / 探测
 * 运行: NODE_PATH=... node _smoke.js
 */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const DIR = path.resolve(__dirname, '01代码实现');
const HTML = fs.readFileSync(path.join(DIR, '预览.html'), 'utf-8');

let pass = 0, fail = 0;
function check(name, cond, info) {
    if (cond) { pass++; console.log('  ✓ ' + name); }
    else { fail++; console.log('  ✗ ' + name + (info ? ' [' + info + ']' : '')); }
}

/* ---- 收集错误信息但不停 run ---- */
const vc = new VirtualConsole();
vc.on('jsdomError', e => console.error('jsdomError:', e.message));

/* ---- 移除所有外链脚本; 把 jQuery 与 sanyidictmap.js 都内联 ---- */
const jq = fs.readFileSync(path.join(__dirname, '_tmp', 'jquery-1.11.3.min.js'), 'utf-8');
const biz = fs.readFileSync(path.join(DIR, 'sanyidictmap.js'), 'utf-8');
const inlined = HTML
    .replace(/<script src="https:\/\/code\.jquery\.com[^"]*"><\/script>/, '')
    .replace(/<script>\s*if \(typeof jQuery === "undefined"\)[\s\S]*?<\/script>/, '')
    .replace(/<script type="text\/javascript" src="\.\.\/scripts\/sanyidictmap\.js"><\/script>/, '')
    .replace(/<script type="text\/javascript" src="sanyidictmap\.js"><\/script>/, '<script>' + biz + '</' + 'script>')
    .replace(/<\/head>/, '<script>' + jq + '</' + 'script></head>');

const dom = new JSDOM(inlined, {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    url: 'file:///' + DIR.replace(/\\/g, '/') + '/预览.html',
    virtualConsole: vc,
    resources: undefined,
});

dom.window.addEventListener('error', e => console.error('window error:', e.message));

setTimeout(run, 1200);

function run() {
    const w = dom.window;
    const $ = w.jQuery;
    if (!$) { console.error('jQuery 未注入'); process.exit(2); }
    /* jsdom 没实现 window.confirm, 默认 stub 为 true */
    try { w.confirm = function () { return true; }; w.alert = function () { }; } catch(e) {}
    console.log('\n======== 1. 已绑定值域的字典对照 ========');
    $('#qDomain').val('GB/T 3304-1991');
    /* 默认是「仅未对照」, 此节要验证基础列, 先切到「全部」 */
    $('#qHisShowMode').val('A');
    w.loadDomain(1);
    setTimeout(() => {
        const rows = $('#dgDomain').datagrid('getRows');
        check('能查到 GB/T 3304-1991', rows.some(r => r.DomainCode === 'GB/T 3304-1991'));
        const i = rows.findIndex(r => r.DomainCode === 'GB/T 3304-1991');
        $('#dgDomain').datagrid('selectRow', i);
        setTimeout(() => {
            check('右侧进入字典对照模式', $('#hisDictBox').css('display') !== 'none');
            check('hisModeTag 显示绑定信息', /字典对照/.test($('#hisModeTag').text()), $('#hisModeTag').text());
            setTimeout(() => {
                const hisRows = $('#dgHis').datagrid('getRows');
                check('HIS 字典有数据(SQL 模拟)', hisRows.length > 0, 'rows=' + hisRows.length);
                check('首行是 01 = 汉族', hisRows[0] && hisRows[0].Code === '01' && /汉/.test(hisRows[0].Desc), JSON.stringify(hisRows[0]));

                console.log('\n======== 2. 选择条目 → 回显对照 ========');
                const itemRows = $('#dgItem').datagrid('getRows');
                check('条目表加载', itemRows.length > 0);
                $('#dgItem').datagrid('selectRow', 0);
                setTimeout(() => {
                    const itemRows0 = $('#dgItem').datagrid('getRows');
                    const firstCode = itemRows0[0] ? itemRows0[0].ItemCode : '';
                    const curRel = $('#dgCurRel').datagrid('getRows');
                    check('当前对照回显(预置 01, 首条 itemCode=' + firstCode + ')',
                        curRel.some(r => r.HisCode === '01'), JSON.stringify(curRel));

                    console.log('\n======== 3. 勾选并保存新对照 ========');
                    const allRows = $('#dgHis').datagrid('getRows');
                    const i01 = allRows.findIndex(r => r.Code === '01');
                    const i02 = allRows.findIndex(r => r.Code === '02');
                    if (i01 >= 0) $('#dgHis').datagrid('uncheckRow', i01);
                    if (i02 >= 0) $('#dgHis').datagrid('checkRow', i02);
                    w.saveDictRel();
                    setTimeout(() => {
                        const cur2 = $('#dgCurRel').datagrid('getRows');
                        check('保存后当前对照已切换为 02',
                            cur2.some(r => r.HisCode === '02') && !cur2.some(r => r.HisCode === '01'),
                            JSON.stringify(cur2));

                        console.log('\n======== 3.5 显示模式 ========');
                        /* 默认「仅未对照」: 01 已对照, 不应出现在列表中 */
                        $('#qHisShowMode').val('N');
                        $('#qHisShowMode').change();
                        setTimeout(() => {
                            const rowsN = $('#dgHis').datagrid('getRows');
                            check('默认 N 模式 01 不在结果中',
                                !rowsN.some(r => r.Code === '01'), 'rows=' + rowsN.map(r => r.Code).join(','));
                            /* 全部模式: 01 出现且被标 rel-hit + checkbox 禁用 */
                            $('#qHisShowMode').val('A');
                            $('#qHisShowMode').change();
                            setTimeout(() => {
                                const rowsA = $('#dgHis').datagrid('getRows');
                                const i01a = rowsA.findIndex(r => r.Code === '01');
                                check('A 模式 01 出现在结果中', i01a >= 0);
                                const ck01 = w.document.querySelector('.subBlock > .dg-wrap tbody tr[data-i="' + i01a + '"] .dg-ck');
                                check('A 模式 01 复选框被禁用', ck01 && ck01.disabled === true,
                                    'disabled=' + (ck01 && ck01.disabled));
                                check('A 模式 01 行带 rel-locked class',
                                    w.document.querySelector('.subBlock > .dg-wrap tbody tr[data-i="' + i01a + '"]').classList.contains('rel-locked'));
                                /* 仅已对照模式: 只剩 01 */
                                $('#qHisShowMode').val('M');
                                $('#qHisShowMode').change();
                                setTimeout(() => {
                                    const rowsM = $('#dgHis').datagrid('getRows');
                                    check('M 模式 只显示已对照(01)',
                                        rowsM.length >= 1 && rowsM.every(r => r.Code === '01'),
                                        'rows=' + rowsM.map(r => r.Code).join(','));
                                    /* 恢复成 A 模式以继续后面的 Tab 测试 */
                                    $('#qHisShowMode').val('A');
                                    $('#qHisShowMode').change();
                                    setTimeout(() => { runStep4(); }, 200);
                                }, 400);
                                }, 400);
                            }, 400);
                        }, 400);
                    }, 400);
                }, 400);
            }, 400);
        }, 400);
}
/* ======= 4. 查询 Tab ======= */
function runStep4() {
    const $ = dom.window.jQuery, w = dom.window;
    /* rPlat 下拉已启用平台过滤 */
    const rPlatOpts = $('#rPlat option').toArray().map(o => o.value);
    check('rPlat 默认过滤出已启用平台', rPlatOpts.length === 1 && rPlatOpts[0] === 'SY',
                            'opts=' + JSON.stringify(rPlatOpts));
                        /* rDomainSel 下拉按平台联动加载值域 */
                        const rDomOpts = $('#rDomainSel option').toArray().map(o => o.value);
                        check('rDomainSel 默认有【全部】+ 多个值域', rDomOpts.length > 1 && rDomOpts[0] === '',
                            'count=' + rDomOpts.length);
                        check('rDomainSel 含 GB/T 3304-1991', rDomOpts.indexOf('GB/T 3304-1991') > 0);
                        /* 用下拉精确选值域查询 */
                        $('#rDomainSel').val('GB/T 3304-1991');
                        $('#rDomainSel').change();
                        setTimeout(() => {
                            const onlyRows = $('#dgRel').datagrid('getRows');
                            check('用 rDomainSel 精确值域后只命中 GB/T 3304-1991',
                                onlyRows.every(r => r.DomainCode === 'GB/T 3304-1991'),
                                'rows=' + onlyRows.length + ' sample=' + (onlyRows[0] && onlyRows[0].DomainCode));

                            /* 切换自由文本应让下拉清空(互斥) */
                            $('#rDomain').val('GB/T 3304');
                            $('#rDomain').trigger('input');
                            check('输入值域后下拉自动清空', $('#rDomainSel').val() === '',
                                'sel=' + $('#rDomainSel').val());

                            /* 恢复现场 */
                            $('#rDomain').val('');
                            $('#rDomainSel').val('');
                            $('#rItem').val('蒙古');
                            w.loadRel(1);
                            setTimeout(() => {
                                const relRows = $('#dgRel').datagrid('getRows');
                                check('rItem=蒙古 能找到 02=蒙古族 对照',
                                    relRows.some(r => r.DomainCode === 'GB/T 3304-1991' && r.ItemCode === firstCode));

                                /* ======= 4.5 反查接口 QueryRelByHis ======= */
                                console.log('\n======== 4.5 反查接口 ========');
                                let byHisOk = 0, byHisTotal = 8;
                                /* 通过 $m 直接调用(此接口对外暴露, 也可走 api() 帮助函数) */
                                w.$m({ ClassName: 'web.YZSY.DHCSYDictMap', MethodName: 'QueryRelByHis',
                                       PlatCode: 'SY', DomainCode: 'GB/T 3304-1991', HisCode: '02' },
                                    function(rsTxt) {
                                        /* $m 回调是 JSON 字符串 */
                                        var rs = (typeof rsTxt === 'string') ? safeJSON(rsTxt) : rsTxt;
                                        if (rs && rs.success) byHisOk++;
                                        check('QueryRelByHis 命中 success=true', rs && rs.success === true,
                                            JSON.stringify(rs).slice(0, 160));
                                        if (rs && rs.found === true) byHisOk++;
                                        check('QueryRelByHis found=true', rs && rs.found === true);
                                        if (rs && rs.count >= 1) byHisOk++;
                                        check('QueryRelByHis count>=1', rs && rs.count >= 1, 'count=' + (rs && rs.count));
                                        var items = (rs && rs.rows) || [];
                                        if (items.some(function(r) { return r.ItemCode === '02'; })) byHisOk++;
                                        check('QueryRelByHis 含 ItemCode=02', items.some(function(r) { return r.ItemCode === '02'; }));
                                        if (items.some(function(r) { return /蒙古/.test(r.ItemName || ''); })) byHisOk++;
                                        check('QueryRelByHis 含 ItemName≈蒙古族', items.some(function(r) { return /蒙古/.test(r.ItemName || ''); }),
                                            items.map(function(r){ return r.ItemCode+':'+r.ItemName; }).join(' | '));
                                        if (rs && rs.HisDictCode) byHisOk++;
                                        check('QueryRelByHis 回填 HisDictCode', rs && rs.HisDictCode,
                                            'his=' + (rs && rs.HisDictCode));
                                    });
                                /* 未命中场景 */
                                w.$m({ ClassName: 'web.YZSY.DHCSYDictMap', MethodName: 'QueryRelByHis',
                                       PlatCode: 'SY', DomainCode: 'GB/T 3304-1991', HisCode: 'XXNOTEXIST' },
                                    function(rsTxt) {
                                        var rs = (typeof rsTxt === 'string') ? safeJSON(rsTxt) : rsTxt;
                                        if (rs && rs.found === false) byHisOk++;
                                        check('QueryRelByHis 未知 HIS found=false',
                                            rs && rs.found === false, JSON.stringify(rs).slice(0, 160));
                                        if (rs && rs.count === 0) byHisOk++;
                                        check('QueryRelByHis 未知 HIS count=0', rs && rs.count === 0);
                                    });
                                /* 空参数校验 */
                                w.$m({ ClassName: 'web.YZSY.DHCSYDictMap', MethodName: 'QueryRelByHis',
                                       PlatCode: '', DomainCode: '', HisCode: '' },
                                    function(rsTxt) {
                                        var rs = (typeof rsTxt === 'string') ? safeJSON(rsTxt) : rsTxt;
                                        if (rs && rs.success === false) byHisOk++;
                                        check('QueryRelByHis 空参数被拒',
                                            rs && rs.success === false, 'msg=' + (rs && rs.msg));
                                    });
                                /* 反向: 没绑定的平台/值域 */
                                w.$m({ ClassName: 'web.YZSY.DHCSYDictMap', MethodName: 'QueryRelByHis',
                                       PlatCode: 'SY', DomainCode: 'CVDOESNOTEXIST', HisCode: 'X' },
                                    function(rsTxt) {
                                        var rs = (typeof rsTxt === 'string') ? safeJSON(rsTxt) : rsTxt;
                                        if (rs && rs.success === false) byHisOk++;
                                        check('QueryRelByHis 无效值域 success=false',
                                            rs && rs.success === false, 'msg=' + (rs && rs.msg));
                                    });
                                /* 延迟等回调跑完 */
                                setTimeout(() => { runNew(); }, 400);
                            }, 500);
                        }, 500);
}

/* ======= 5. 未绑定值域 + 就地新增字典 ======= */
function runNew() {
    console.log('\n======== 5. 未绑定值域 + 就地新增字典 ========');
    const $ = dom.window.jQuery, w = dom.window;
    setTimeout(() => {
        $('#qDomain').val('LY.00.63');
        w.loadDomain(1);
        setTimeout(() => {
            const rows = $('#dgDomain').datagrid('getRows');
            const ix = rows.findIndex(r => r.DomainCode === 'LY.00.63');
            check('LY.00.63 出现在列表中', ix >= 0);
            if (ix < 0) { finish(); return; }
            $('#dgDomain').datagrid('selectRow', ix);
            setTimeout(() => {
                check('右侧显示【未绑定】引导面板', $('#unbindBox').css('display') !== 'none', 'style=' + $('#unbindBox').attr('style'));
                check('dgHis 已隐藏', $('#hisDictBox').css('display') === 'none');
                check('hisModeTag 含 "未绑定"', /未绑定/.test($('#hisModeTag').text()), $('#hisModeTag').text());

                w.openBindDlg('new');
                setTimeout(() => {
                    check('绑定弹窗已打开', !!w.document.getElementById('dlgBind'));
                    check('弹窗含 tabs', $('#bdTabs').length > 0);
                    check('默认 Tab = 就地新增',
                        (function() { try { return $('#bdTabs').tabs('getSelected').index() === 1; } catch(e) { return false; } })());

                    /* 切到枚举方式 */
                    $('#bdMode').val('E');
                    w.toggleBindMode();
                    setTimeout(() => {
                        check('枚举 textarea 已显示', $('#bdEnumBox').css('display') !== 'none');
                        check('SQL textarea 已隐藏', $('#bdSqlBox').css('display') === 'none');

                        /* 通过直接 $m 调 SaveHisDict + SaveDomainHisDict,模拟"就地新增并绑定" */
                        const code = 'LY00_63_DEMO';
                        let r1 = null, r2 = null;
                        w.$m({ ClassName: 'web.YZSY.DHCSYDictMap', MethodName: 'SaveHisDict',
                               DictCode: code, DictName: 'LY.00.63 演示枚举', Mode: 'E',
                               SqlText: 'A=甲\nB=乙\nC=丙', ActiveFlag: 'Y', Memo: '' },
                            function(rs1) {
                                r1 = rs1;
                                w.$m({ ClassName: 'web.YZSY.DHCSYDictMap', MethodName: 'SaveDomainHisDict',
                                       PlatCode: 'SY', DomainCode: 'LY.00.63', HisDictCode: code },
                                    function(rs2) { r2 = rs2;
                                        setTimeout(() => {
                                            check('SaveHisDict 接受', r1 && r1.success, r1 && r1.msg);
                                            check('SaveDomainHisDict 接受', r2 && r2.success, r2 && r2.msg);

                                            /* 重新查询 LY.00.63 */
                                            w.loadDomain(1);
                                                const r3 = $('#dgDomain').datagrid('getRows');
                                                const ix2 = r3.findIndex(r => r.DomainCode === 'LY.00.63');
                                                check('LY.00.63 仍在列表', ix2 >= 0);
                                                $('#dgDomain').datagrid('selectRow', ix2);
                                                setTimeout(() => {
                                                    check('绑定后右侧进入字典对照', $('#hisDictBox').css('display') !== 'none');
                                                    check('hisModeTag 显示新字典',
                                                        $('#hisModeTag').text().indexOf('LY00_63_DEMO') >= 0,
                                                        $('#hisModeTag').text());
                                                    setTimeout(() => {
                                                        const his = $('#dgHis').datagrid('getRows');
                                                        check('枚举字典加载到 HIS 列表(3条)', his.length === 3, JSON.stringify(his.map(r => r.Code)));
                                                        /* 在新字典里存一条对照 */
                                                        $('#dgHis').datagrid('checkRow', 0);
                                                        const its = $('#dgItem').datagrid('getRows');
                                                        $('#dgItem').datagrid('selectRow', 0);
                                                        setTimeout(() => {
                                                            w.saveDictRel();
                                                            setTimeout(() => {
                                                                const cur = $('#dgCurRel').datagrid('getRows');
                                                                check('LY.00.63 已建一条对照', cur.length === 1 && cur[0].HisCode === 'A');
                                                                runPickBind();
                                                            }, 600);
                                                        }, 600);
                                                    }, 700);
                                                }, 700);
                                            }, 600);
                                        }, 100);
                                    });
                            });
                    }, 200);
                }, 600);
            }, 600);
        }, 500);
}

/* ======= 6. 绑定已有字典 ======= */
function runPickBind() {
    console.log('\n======== 6. 绑定已有字典 流程 ========');
    const $ = dom.window.jQuery, w = dom.window;
    $('#qDomain').val('LY.00.2');
    w.loadDomain(1);
    setTimeout(() => {
        const rows = $('#dgDomain').datagrid('getRows');
        const ix = rows.findIndex(r => r.DomainCode === 'LY.00.2');
        check('LY.00.2 在列表', ix >= 0);
        if (ix < 0) { finish(); return; }
        $('#dgDomain').datagrid('selectRow', ix);
        setTimeout(() => {
            check('LY.00.2 仍是未绑定', $('#unbindBox').css('display') !== 'none');
            w.openBindDlg('pick');
            setTimeout(() => {
                check('绑定弹窗打开(pick)', !!w.document.getElementById('dlgBind'));
                check('当前 Tab = 绑定已有',
                    (function() { try { return $('#bdTabs').tabs('getSelected').index() === 0; } catch(e) { return false; } })());
                const opts = $('#bdDict option').map(function() { return this.value; }).get();
                check('已有字典列表 ≥3 项', opts.length >= 3, 'count=' + opts.length);
                check('包含演示字典 CT_SEX', opts.some(v => v === 'CT_SEX'));
                w.$m({ ClassName: 'web.YZSY.DHCSYDictMap', MethodName: 'SaveDomainHisDict',
                       PlatCode: 'SY', DomainCode: 'LY.00.2', HisDictCode: 'CT_SEX' },
                    function(rs) {
                        check('SaveDomainHisDict 成功', rs && rs.success, rs && rs.msg);
                        w.loadDomain(1);
                        setTimeout(() => {
                            const r2 = $('#dgDomain').datagrid('getRows');
                            const ix2 = r2.findIndex(r => r.DomainCode === 'LY.00.2');
                            $('#dgDomain').datagrid('selectRow', ix2);
                            setTimeout(() => {
                                check('LY.00.2 已经绑定到 CT_SEX',
                                    $('#hisModeTag').text().indexOf('CT_SEX') >= 0, $('#hisModeTag').text());
                                runTab3();
                            }, 500);
                        }, 500);
                    });
            }, 400);
        }, 500);
    }, 500);
}

/* ======= 7. Tab3 注册字典 ======= */
function runTab3() {
    console.log('\n======== 7. Tab3 字典注册 / 探测 ========');
    const $ = dom.window.jQuery, w = dom.window;
    setTimeout(() => {
        w.loadDict();
        setTimeout(() => {
            const dictRows = $('#dgDict').datagrid('getRows');
            check('Tab3 字典列表非空', dictRows.length > 0);
            w.probeDict('CT_SEX');
            setTimeout(() => {
                check('探测弹窗已打开', !!w.document.getElementById('dlgProbe'));
                const probeText = $('#dlgProbe').text();
                check('探测结果含【男】', /男/.test(probeText));
                check('探测结果含【女】', /女/.test(probeText));
                if (w.document.getElementById('dlgProbe')) { $('#dlgProbe').dialog('close'); }
                w.$m({ ClassName: 'web.YZSY.DHCSYDictMap', MethodName: 'SaveHisDict',
                       DictCode: 'TARI_NEW', DictName: '新收费项目', Mode: 'S',
                       SqlText: 'SELECT TOP 5 TAR_RowID AS id, TAR_Code AS code, TAR_Desc AS desc FROM DHCTARI',
                       ActiveFlag: 'Y', Memo: 'smoke 创建' },
                    function(rs) {
                        check('新建 SQL 字典成功', rs && rs.success, rs && rs.msg);
                        w.loadDict();
                        setTimeout(() => {
                            const d2 = $('#dgDict').datagrid('getRows');
                            check('新字典 TARI_NEW 出现在列表',
                                d2.some(r => r.DictCode === 'TARI_NEW' && r.Mode === 'S'));
                            finish();
                        }, 300);
                    });
            }, 400);
        }, 400);
    }, 400);
}

function finish() {
    console.log('\n======== 合计 ========');
    console.log(`通过: ${pass} / ${fail + pass}`);
    setTimeout(() => process.exit(fail === 0 ? 0 : 1), 200);
}
