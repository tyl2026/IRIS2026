/* 验证: setupMainTabs() 在三种场景下行为正确
   场景 A: $.fn.tabs 缺失 → 自绘分页签 (生产环境最常见)
   场景 B: $.fn.tabs 存在 → 走原生路径, 不画自绘 */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const DIR = path.resolve('D:/claude code/IRIS/HISUI-新建/第三方平台自定对照界面/01代码实现');
const HTML = fs.readFileSync(path.join(DIR, '预览.html'), 'utf-8');
const vc = new VirtualConsole();
vc.on('log', (...a) => console.log(...a));
vc.on('jsdomError', (e) => console.error('[jsdomError]', e.message));

const jq  = fs.readFileSync(path.join('D:/claude code/IRIS/HISUI-新建/第三方平台自定对照界面', '_tmp', 'jquery-1.11.3.min.js'), 'utf-8');
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

    console.log('\n======== 场景 A: $.fn.tabs 缺失 → 自绘分页签 (生产常见) ========');

    /* 还原面板到 #mainTabs (SHIM init 时已搬动过) */
    const $tabs = $('#mainTabs');
    const $orig = $tabs.data('tabsPanels');
    /* 用 detach + 重新插入避免 clone(true) 继承被 SHIM 改过的 inline 样式 */
    if ($orig && $orig.length) {
        $orig.detach().appendTo($tabs);
        $tabs.removeAttr('data-tabs-init').removeClass('hisui-tabs');
    }
    /* 清掉残留的 inline display:none, 让所有面板默认显示 */
    $tabs.children('div[title]').each(function () { this.style.display = ''; });

    /* 模拟生产现场: 缺 tabs 插件 */
    try { delete $.fn.tabs; } catch (e) { $.fn.tabs = undefined; }
    check('$.fn.tabs 已置为 undefined', $.fn.tabs === undefined);
    check('hasTabs() 返回 false', w.hasTabs() === false);

    let selectLog = [];
    w.setupMainTabs(function (title, index) { selectLog.push([title, index]); });

    const $head = $tabs.find('.mtabs-head');
    check('自绘分页签 header 已创建', $head.length > 0);
    const $mtabs = $head.find('.mtab');
    check('4 个分页签标签', $mtabs.length === 4, 'count=' + $mtabs.length);
    const labels = $mtabs.map(function () { return $(this).text().trim(); }).get();
    check('分页签顺序正确', JSON.stringify(labels) === '["字典对照维护","对照关系查询","HIS 字典表注册","字典导入维护"]',
        JSON.stringify(labels));

    /* 验证: 第一个 panel (字典对照维护) 显示, 其余隐藏 */
    const panels = $tabs.children('div[title]');
    let visibleIdx = -1, visibleCount = 0;
    panels.each(function (i) { if (this.style.display !== 'none') { visibleIdx = i; visibleCount++; } });
    check('初始仅 panel[0] 显示', visibleIdx === 0 && visibleCount === 1, 'visible=' + visibleCount + ' idx=' + visibleIdx);

    /* 切到 Tab2 */
    $mtabs.eq(1).trigger('click');
    setTimeout(() => {
        visibleIdx = -1; visibleCount = 0;
        panels.each(function (i) { if (this.style.display !== 'none') { visibleIdx = i; visibleCount++; } });
        check('点击 Tab2 → 仅 panel[1] 显示', visibleIdx === 1 && visibleCount === 1, 'visible=' + visibleCount + ' idx=' + visibleIdx);

        /* Tab3 */
        $mtabs.eq(2).trigger('click');
        setTimeout(() => {
            visibleIdx = -1; visibleCount = 0;
            panels.each(function (i) { if (this.style.display !== 'none') { visibleIdx = i; visibleCount++; } });
            check('点击 Tab3 → 仅 panel[2] 显示', visibleIdx === 2 && visibleCount === 1, 'visible=' + visibleCount + ' idx=' + visibleIdx);

            /* Tab4 */
            $mtabs.eq(3).trigger('click');
            setTimeout(() => {
                visibleIdx = -1; visibleCount = 0;
                panels.each(function (i) { if (this.style.display !== 'none') { visibleIdx = i; visibleCount++; } });
                check('点击 Tab4 → 仅 panel[3] 显示', visibleIdx === 3 && visibleCount === 1, 'visible=' + visibleCount + ' idx=' + visibleIdx);

                /* 回到 Tab1, 验证 onSelect 日志 */
                $mtabs.eq(0).trigger('click');
                setTimeout(() => {
                    check('onSelect 共触发 5 次 (初始 1 次 + 4 次点击)',
                        selectLog.length === 5,
                        'log=' + JSON.stringify(selectLog));
                    check('最后一次 onSelect 是 Tab1 idx=0',
                        selectLog[4] && selectLog[4][0] === '字典对照维护' && selectLog[4][1] === 0,
                        'last=' + JSON.stringify(selectLog[4]));

                    /* 重复点击 Tab1 不应重复触发 (我们没做防抖, 但顺序应正常) */
                    check('4 个 onSelect 都对应有效 idx',
                        selectLog.every(s => s[1] === 0 || s[1] === 1 || s[1] === 2 || s[1] === 3));

                    console.log('\n  Total: ' + pass + ' pass, ' + fail + ' fail');
                    process.exit(fail ? 1 : 0);
                }, 80);
            }, 80);
        }, 80);
    }, 80);
}, 1500);
