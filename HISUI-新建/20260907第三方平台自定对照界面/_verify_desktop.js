/* 验证: 桌面交付目录(通用采集字典对照/01代码实现)生成的 预览.html
   1) 5 页签渲染与切换  2) 各 datagrid 数据加载  3) 新增接口 mock (ImportDomainRows/ImportDomainFile) */
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
    .replace(/<script>\s*if \(typeof jQuery === "undefined"\)[\s\S]*?<\/script>/, '')
    .replace(/<script type="text\/javascript" src="sanyidictmap\.js"><\/script>/, '<script>' + biz + '</' + 'script>')
    .replace(/<\/head>/, '<script>' + jq + '</' + 'script></head>');

const dom = new JSDOM(inlined, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc });

let pass = 0, fail = 0;
function check(label, ok, extra) {
    if (ok) { pass++; console.log('  OK', label); }
    else    { fail++; console.log('  XX', label, ' extra=', extra || ''); }
}

setTimeout(() => {
    const w = dom.window;
    const $ = w.jQuery;
    const PARSE = (t) => { try { return JSON.parse(t); } catch (e) { return null; } };

    console.log('======== 1) 页签结构 ========');
    // SHIM tabs 初始化时会把面板搬进 .tabs-body, 这里从渲染出的 tab 标签取标题
    const titles = $('#mainTabs').find('.t, .mtab').map(function () { return $(this).text().trim(); }).get();
    check('共 5 个页签', titles.length === 5, JSON.stringify(titles));
    const wantTitles = ['字典对照维护', '对照关系查询', '对照覆盖查询', 'HIS 字典表注册', '字典导入维护'];
    check('页签标题与需求一致', JSON.stringify(titles) === JSON.stringify(wantTitles), JSON.stringify(titles));
    check('tabs 已初始化', $('#mainTabs').attr('data-tabs-init') === '1' || $('.tabs-head').length > 0);

    console.log('======== 2) Tab1 值域/条目加载 ========');
    const domRows = $('#dgDomain').datagrid('getRows');
    check('dgDomain 有数据(>0)', domRows.length > 0, 'rows=' + domRows.length);
    const r0 = domRows[0] || {};
    check('值域行字段齐全', !!(r0.DomainCode && r0.DomainName !== undefined && r0.ItemCnt !== undefined && r0.MappedCnt !== undefined && r0.RelCnt !== undefined), JSON.stringify(r0).substring(0, 160));
    if (domRows.length) {
        w.selectDomain(domRows[0]);
        setTimeout(() => {
            const itemRows = $('#dgItem').datagrid('getRows');
            check('点击值域后 dgItem 有数据', itemRows.length > 0, 'rows=' + itemRows.length);

            console.log('======== 3) 各页签数据(mock $m 直查) ========');
            let pending = 0, doneAll = () => { finish(); };
            const call = (label, method, params, judge) => {
                pending++;
                const payload = { ClassName: 'x', MethodName: method };
                for (const k in params) { payload[k] = params[k]; }
                w.$m(payload, function (txt) {
                    const rs = PARSE(typeof txt === 'string' ? txt : (txt && txt.responseText) || '');
                    check(label, judge(rs), (rs ? JSON.stringify(rs).substring(0, 140) : String(txt).substring(0, 140)));
                    if (--pending === 0) doneAll();
                });
                // $m mock 是 setTimeout 0 异步
            };
            call('QueryPlatform 返回平台列表', 'QueryPlatform', {}, (rs) => rs && rs.total >= 1 && rs.rows.length >= 1 && rs.rows[0].PlatCode);
            call('QueryRel 返回对照关系', 'QueryRel', {}, (rs) => rs && rs.rows && rs.rows.length >= 1);
            call('QueryRelCoverage 返回覆盖统计', 'QueryRelCoverage', { PlatCode: 'SY', DomainCode: 'GB/T 3304-1991', DictCode: 'CT_NATION', Filter: '' }, (rs) => rs && rs.success === true && rs.rows && rs.rows.length > 0 && rs.total > 0 && rs.mapped !== undefined);
            call('QueryRelByHis 反查 01 → 汉族', 'QueryRelByHis', { PlatCode: 'SY', DomainCode: 'GB/T 3304-1991', HisCode: '01' }, (rs) => rs && rs.found === true && rs.count >= 1);
            call('ImportDomainRows 分批导入', 'ImportDomainRows', { PlatCode: 'SY', JsonText: JSON.stringify([
                { domCode: 'VERIFY.DOM.1', domName: '验证值域', itemCode: 'A', itemName: '甲', memo: '' },
                { domCode: 'VERIFY.DOM.1', domName: '验证值域', itemCode: 'B', itemName: '乙', memo: '' }
            ]), ClearFlag: 'N' }, (rs) => rs && rs.success === true && rs.item === 2 && rs.domain === 1);
            call('ImportDomainRows 追加不重复计值域', 'ImportDomainRows', { PlatCode: 'SY', JsonText: JSON.stringify([
                { domCode: 'VERIFY.DOM.1', domName: '验证值域', itemCode: 'C', itemName: '丙', memo: '' }
            ]), ClearFlag: 'N' }, (rs) => rs && rs.success === true && rs.item === 1 && rs.domain === 0);
            call('ImportDomainRows 清空标记生效', 'ImportDomainRows', { PlatCode: 'SY', JsonText: JSON.stringify([
                { domCode: 'VERIFY.DOM.2', domName: '验证值域2', itemCode: 'X', itemName: 'X', memo: '' }
            ]), ClearFlag: 'Y' }, (rs) => rs && rs.success === true);
            call('ImportDomainRows 平台不存在报错', 'ImportDomainRows', { PlatCode: 'NOPE', JsonText: '[{}]', ClearFlag: 'N' }, (rs) => rs && rs.success === false);
            call('ImportDomainFile 路径导入成功', 'ImportDomainFile', { PlatCode: 'SY', FilePath: 'D:\\data\\demo.csv', ClearFlag: 'N' }, (rs) => rs && rs.success === true && rs.item >= 1);
            call('ImportDomainFile 路径不存在报错', 'ImportDomainFile', { PlatCode: 'SY', FilePath: 'D:\\data\\notfound.csv', ClearFlag: 'N' }, (rs) => rs && rs.success === false);
            // ExportRel 为原始 CSV 文本, 在第 4 节单独验证

            function finish() {
                console.log('======== 4) 导出文本 ========');
                w.$m({ ClassName: 'x', MethodName: 'ExportRel' }, function (txt) {
                    const t = String(txt);
                    check('ExportRel 含表头与数据行', t.indexOf('平台代码') >= 0 && t.split('\n').length >= 2, t.substring(0, 80));

                    console.log('======== 5) 逐页签切换, 各 grid 实际加载 ========');
                    // Tab2 对照关系查询
                    $('#mainTabs').tabs('select', 1);
                    setTimeout(() => {
                        const relRows = $('#dgRel').datagrid('getRows');
                        check('Tab2 dgRel 加载数据', relRows.length > 0, 'rows=' + relRows.length);
                        // Tab3 对照覆盖查询: 需先选 HIS 字典再查询(产品设计), 手动触发
                        $('#mainTabs').tabs('select', 2);
                        setTimeout(() => {
                            $('#covDict').val('CT_NATION');
                            w.loadCov(1);
                            setTimeout(() => {
                                const covRows = $('#dgCov').datagrid('getRows');
                                check('Tab3 dgCov 加载数据', covRows.length > 0, 'rows=' + covRows.length);
                                check('Tab3 覆盖统计渲染', ($('#covStat').text() || '').indexOf('覆盖率') >= 0, $('#covStat').text());
                                // Tab4 HIS 字典表注册
                                $('#mainTabs').tabs('select', 3);
                                setTimeout(() => {
                                    const dictRows = $('#dgDict').datagrid('getRows');
                                    check('Tab4 dgDict 加载数据', dictRows.length > 0, 'rows=' + dictRows.length);
                                    // Tab5 字典导入维护
                                    $('#mainTabs').tabs('select', 4);
                                    setTimeout(() => {
                                        const platRows = $('#dgPlat').datagrid('getRows');
                                        check('Tab5 dgPlat 加载数据', platRows.length > 0, 'rows=' + platRows.length);
                                        console.log('\n结果: ' + pass + ' 通过, ' + fail + ' 失败');
                                        process.exit(fail > 0 ? 1 : 0);
                                    }, 500);
                                }, 500);
                            }, 500);
                        }, 500);
                    }, 500);
                });
            }
        }, 400);
    } else {
        console.log('\n结果: ' + pass + ' 通过, ' + fail + ' 失败');
        process.exit(1);
    }
}, 800);
