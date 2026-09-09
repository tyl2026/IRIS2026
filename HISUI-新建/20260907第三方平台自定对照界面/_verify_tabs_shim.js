/* 验证: 在 SHIM 环境下 ($.fn.tabs 存在且生效), setupMainTabs 走原生路径 */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const DIR = path.resolve('D:/claude code/IRIS/HISUI-新建/20260907第三方平台自定对照界面/01代码实现');
const HTML = fs.readFileSync(path.join(DIR, '预览.html'), 'utf-8');
const vc = new VirtualConsole();
vc.on('log', (...a) => console.log(...a));
vc.on('jsdomError', (e) => console.error('[jsdomError]', e.message));

const jq  = fs.readFileSync(path.join('D:/claude code/IRIS/HISUI-新建/20260907第三方平台自定对照界面', '_tmp', 'jquery-1.11.3.min.js'), 'utf-8');
const biz = fs.readFileSync(path.join(DIR, 'sanyidictmap.js'), 'utf-8');

const inlined = HTML
    .replace(/<script src="https:\/\/code\.jquery\.com[^"]*"><\/script>/, '')
    .replace(/<script>\s*if \(typeof jQuery === "undefined"\)[\s\S]*?<\/script>/, '')
    .replace(/<script type="text\/javascript" src="\.\.\/scripts\/sanyidictmap\.js"><\/script>/, '')
    .replace(/<script type="text\/javascript" src="sanyidictmap\.js"><\/script>/, '<script>' + biz + '</' + 'script>')
    .replace(/<\/head>/, '<script>' + jq + '</' + 'script></head>');

const dom = new JSDOM(inlined, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc, resources: undefined });

let pass = 0, fail = 0;
function check(label, ok, extra) {
    if (ok) { pass++; console.log('  ✓', label); }
    else    { fail++; console.log('  ✗', label, '  extra=', extra || ''); }
}

setTimeout(() => {
    const w = dom.window;
    const $ = w.jQuery;

    console.log('\n======== SHIM 环境: $.fn.tabs 存在且生效 ========');

    /* 不要碰 $.fn.tabs, 让 SHIM 原生 mock 留着 */
    check('$.fn.tabs 存在', typeof $.fn.tabs === 'function');
    check('hasTabs() 返回 true', w.hasTabs() === true);

    /* SHIM 的 init 已经跑过 setupMainTabs, 检查最终状态 */
    const $tabs = $('#mainTabs');
    const $shimHead = $tabs.children('.tabs-head');   /* SHIM 原生 */
    const $manualHead = $tabs.children('.mtabs-head'); /* 我们的自绘 */
    check('SHIM 自带的 .tabs-head 已渲染 (SHIM 原生 tabs 生效)', $shimHead.length > 0);
    check('未触发自绘 (.mtabs-head 不存在)', $manualHead.length === 0);
    check('data-tabs-init = 1', $tabs.attr('data-tabs-init') === '1');

    /* SHIM tabs 已经默认选中第一个, 验证 */
    const $tabs2 = $tabs.find('.tabs-head .t');
    if ($tabs2.length >= 2) {
        check('SHIM tabs 默认第一个 on', $tabs2.eq(0).hasClass('on'));
        /* 点击第二个 */
        $tabs2.eq(1).trigger('click');
        setTimeout(() => {
            check('点击后 SHIM 切到第二个 on', $tabs2.eq(1).hasClass('on'));
            check('点击后第一个 off', !$tabs2.eq(0).hasClass('on'));
            console.log('\n  Total: ' + pass + ' pass, ' + fail + ' fail');
            process.exit(fail ? 1 : 0);
        }, 100);
    } else {
        console.log('\n  Total: ' + pass + ' pass, ' + fail + ' fail');
        process.exit(fail ? 1 : 0);
    }
}, 1500);
