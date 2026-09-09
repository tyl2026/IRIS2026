const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const DIR = path.resolve('D:/claude code/IRIS/HISUI-新建/20260907第三方平台自定对照界面/01代码实现');
const HTML = fs.readFileSync(path.join(DIR, '预览.html'), 'utf-8');

const vc = new VirtualConsole();
vc.on('log', (...a) => console.log(...a));
vc.on('jsdomError', (e) => console.error('jsdomError:', e.message));

const jq = fs.readFileSync(path.join('D:/claude code/IRIS/HISUI-新建/20260907第三方平台自定对照界面', '_tmp', 'jquery-1.11.3.min.js'), 'utf-8');
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
    if (ok) { pass++; console.log('  \u2713', label); }
    else    { fail++; console.log('  \u2717', label, '  extra=', extra || ''); }
}

setTimeout(run, 1200);

function run() {
    const w = dom.window;
    const $ = w.jQuery;

    console.log('\n======== Tab1 列名行 checkbox 全选/取消 ========');

    /* 进入 Tab1: 字典对照维护, 加载 GB/T 3304-1991 (有 01-66) */
    $('#qDomain').val('GB/T 3304-1991');
    w.loadDomain(1);

    setTimeout(() => {
        const drows = $('#dgDomain').datagrid('getRows');
        if (drows.length) w.selectDomain(drows[0]);

        setTimeout(() => {
            /* 触发 loadItem(1) */
            w.loadItem(1);

            setTimeout(() => {
                const irows = $('#dgItem').datagrid('getRows');
                console.log('dgItem rows:', irows.length);

                /* 看 dgItem 的实际 DOM */
                const dgHtml = w.document.querySelector('#dgItem').outerHTML.substring(0, 500);
                console.log('dgItem outerHTML[:500]:', dgHtml);
                const wrap = w.document.querySelector('#dgItem').parentElement;
                const wrapHtml = wrap && wrap.outerHTML.substring(0, 800);
                console.log('wrap outerHTML[:800]:', wrapHtml);

                /* 找表头 checkbox */
                const ckall = w.document.querySelector('#dgItem .dg-ckall') || w.document.querySelector('.dg-ckall');
                console.log('dg-ckall exists:', !!ckall, 'ckalls:', w.document.querySelectorAll('.dg-ckall').length);
                if (!ckall) { process.exit(1); }

                /* Step 1: 勾选表头 */
                ckall.checked = true;
                $(ckall).trigger('change');
                setTimeout(() => {
                    const sel = $('#dgItem').datagrid('getChecked');
                    const selLen = sel.length;
                    console.log('after check-all, getChecked length:', selLen);
                    check('勾选后所有行被选中', selLen === irows.length, 'got=' + selLen + ', expect=' + irows.length);

                /* Step 2: 取消勾选表头 — 用 jQuery 当前 DOM 触发，避免 renderGrid 替换后旧引用问题 */
                const $ckall = $('#dgItem').parent().children('.dg-wrap').find('.dg-ckall');
                $ckall.prop('checked', false).trigger('change');
                setTimeout(() => {
                    const sel2 = $('#dgItem').datagrid('getChecked');
                    const st = $('#dgItem').data('dgState');
                    console.log('after uncheck-all, getChecked length:', sel2.length);
                    console.log('after uncheck-all, st.sel =', JSON.stringify(st.sel));
                    /* 也看下 .sel class 是否清空 */
                    const selRows = w.document.querySelectorAll('#dgItem tbody tr.sel');
                    console.log('tbody tr.sel count:', selRows.length);
                    check('取消后所有行被取消', sel2.length === 0, 'got=' + sel2.length);
                    check('取消后无 .sel class 行', selRows.length === 0, 'got=' + selRows.length);

                        console.log('\n  Total: ' + pass + ' pass, ' + fail + ' fail');
                        process.exit(fail ? 1 : 0);
                    }, 300);
                }, 300);
            }, 600);
        }, 600);
    }, 600);
}
