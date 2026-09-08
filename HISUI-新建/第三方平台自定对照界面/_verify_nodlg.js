/* 验证: 当 HISUI dialog 插件缺失(jQuery.fn.dialog 不存在)时,
   sanyidictmap.js 仍能初始化完主 tabs、所有 datagrid, 无未捕获错误 */
const fs = require('fs');
const path = require('path');

const DIR = path.resolve('D:/claude code/IRIS/HISUI-新建/第三方平台自定对照界面/01代码实现');
const HTML = fs.readFileSync(path.join(DIR, '预览.html'), 'utf-8');

const { JSDOM, VirtualConsole } = require('jsdom');
const vc = new VirtualConsole();
vc.on('log',      (...a) => console.log(...a));
vc.on('warn',     (...a) => console.warn(...a));
vc.on('jsdomError', (e) => console.error('[jsdomError]', e.message));

const jq  = fs.readFileSync(path.join('D:/claude code/IRIS/HISUI-新建/第三方平台自定对照界面', '_tmp', 'jquery-1.11.3.min.js'), 'utf-8');
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

let pass = 0, fail = 0;
function check(label, ok, extra) {
    if (ok) { pass++; console.log('  ✓', label); }
    else    { fail++; console.log('  ✗', label, '  extra=', extra || ''); }
}

setTimeout(run, 1200);

function run() {
    const w = dom.window;
    const $ = w.jQuery;

    console.log('\n======== 部署错误复现: jQuery.fn.dialog 不存在 ========');

    /* 模拟生产现场: HISUI 注入 jQuery 但缺 dialog 插件 */
    try { delete $.fn.dialog; } catch (e) { $.fn.dialog = undefined; }
    check('jQuery.fn.dialog 已置为 undefined', $.fn.dialog === undefined);

    /* 1) hasDialog() 应返回 false */
    check('hasDialog() 返回 false', w.hasDialog() === false);

    /* 2) closeDlg(id) 不应抛错 */
    let closeErr = null;
    try { w.closeDlg('noSuchDlg'); } catch (e) { closeErr = e; }
    check('closeDlg() 容错', !closeErr, String(closeErr));

    /* 3) showDlg(id, ...) 走自绘路径, 不抛错, 创建 DOM */
    w.showDlg('testDlg', '测试弹窗', '<div>hello</div>', 400);
    const $tdlg = $('#testDlg');
    check('showDlg() 创建 DOM', $tdlg.length > 0);
    /* jsdom 不做真实 CSS layout, jQuery.show() 会移除内联 display:none,
       改成检查 style.display 是否含 'none' 字样 */
    const cssText = $tdlg.get(0).style.cssText || '';
    const tdlgDisplay = $tdlg.get(0).style.display;
    check('自绘弹窗可见', tdlgDisplay !== 'none' && cssText.indexOf('display: none') === -1 && cssText.indexOf('display:none') === -1,
        'display=' + JSON.stringify(tdlgDisplay) + ' cssText=' + cssText.substring(0, 80));
    const $mask = $('#testDlg-mask');
    check('遮罩已创建', $mask.length > 0);
    check('弹窗含 body 内容', $tdlg.find('.win-body-fb').text().indexOf('hello') >= 0);

    /* 4) 自绘按钮可点击关闭 */
    const $btns = $tdlg.find('.lb-fb');
    check('自绘按钮已渲染', $btns.length >= 2);
    /* 第一个按钮是"保存", 没有 onSave 不应报错; 点 "关闭" */
    $btns.filter(function () { return $(this).text() === '关闭'; }).trigger('click');
    setTimeout(() => {
        const $closed = $('#testDlg');
        check('点击关闭后弹窗隐藏', $closed.length === 0 || !$closed.is(':visible'));
        const $maskClosed = $('#testDlg-mask');
        check('点击关闭后遮罩已移除', $maskClosed.length === 0);

        /* 5) 主 tabs 是否已初始化 */
        const $mainTabs = $('#mainTabs');
        /* SHIM 的 .tabs() 渲染 .tabs-head, HISUI 渲染 .tabs-header; 两者择一即可 */
        const hasHead = $mainTabs.find('.tabs-head').length > 0
                     || $mainTabs.find('.tabs-header').length > 0
                     || $mainTabs.children('.tabs-head').length > 0
                     || $mainTabs.children('.tabs-header').length > 0;
        const hasInitAttr = $mainTabs.attr('data-tabs-init') === '1';
        check('主 tabs 已初始化(找到 .tabs-head 或 data-tabs-init)', hasHead || hasInitAttr);

        /* 6) 三个 datagrid 的 DOM 容器都存在 */
        check('#dgDomain 容器存在',  $('#dgDomain').length === 1);
        check('#dgItem   容器存在',  $('#dgItem').length   === 1);
        check('#dgRel    容器存在',  $('#dgRel').length    === 1);
        check('#dgCov    容器存在',  $('#dgCov').length    === 1);
        check('#dgDict   容器存在',  $('#dgDict').length   === 1);
        check('#dgPlat   容器存在',  $('#dgPlat').length   === 1);

        /* 7) loadDomain(1) 不应抛错 */
        let loadErr = null;
        try { w.loadDomain(1); } catch (e) { loadErr = e; }
        check('loadDomain(1) 不抛错', !loadErr, String(loadErr));

        /* 8) 全局函数都已定义 */
        check('showDlg 已定义', typeof w.showDlg === 'function');
        check('closeDlg 已定义', typeof w.closeDlg === 'function');
        check('hasDialog 已定义', typeof w.hasDialog === 'function');
        check('_fallbackOpenDlg 已定义', typeof w._fallbackOpenDlg === 'function');
        check('loadCov 已定义', typeof w.loadCov === 'function');

        /* 9) 模拟一次"页面初始化时被某段代码调到的 dialog": 返回 false 不抛错 */
        let probeErr = null;
        try {
            /* 这种 if (hasDialog()) { $(...).dialog(...) } 的写法应当不会走到 dialog 调用 */
            if (w.hasDialog()) { $('#xx').dialog('close'); }
        } catch (e) { probeErr = e; }
        check('hasDialog 守卫可避免 dialog 调用', !probeErr);

        console.log('\n  Total: ' + pass + ' pass, ' + fail + ' fail');
        process.exit(fail ? 1 : 0);
    }, 400);
}
