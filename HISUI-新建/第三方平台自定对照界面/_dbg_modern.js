const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const DIR = path.resolve('C:/Users/Admin/Desktop/通用采集字典对照/01代码实现');
const HTML = fs.readFileSync(path.join(DIR, '预览.html'), 'utf-8');
const vc = new VirtualConsole();
vc.on('log', (...a) => console.log('[page]', ...a));
vc.on('jsdomError', (e) => console.error('[jsdomError]', e.message));
const jq  = fs.readFileSync(path.resolve(__dirname, '_tmp', 'jquery-1.11.3.min.js'), 'utf-8');
const biz = fs.readFileSync(path.join(DIR, 'sanyidictmap.js'), 'utf-8');
const inlined = HTML
    .replace(/<script src="https:\/\/code\.jquery\.com[^"]*"><\/script>/, '')
    .replace(/<script>if \(typeof jQuery === "undefined"\)[\s\S]*?<\/script>/, '')
    .replace(/<script type="text\/javascript" src="sanyidictmap\.js"><\/script>/, '<script>' + biz + '</' + 'script>')
    .replace(/<script src="sanyidictmap\.js"><\/script>/, '<script>' + biz + '</' + 'script>')
    .replace('</head>', '<script>' + jq + '</' + 'script></head>');
const dom = new JSDOM(inlined, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc });
setTimeout(() => {
    const w = dom.window;
    console.log('typeof $m =', typeof w.$m);
    console.log('typeof jQuery =', typeof w.jQuery);
    console.log('gPlat =', JSON.stringify(w.gPlat));
    console.log('__state =', w.__state ? JSON.stringify(w.__state()) : 'no __state');
    console.log('#gPlat opts =', w.jQuery('#gPlat option').length);
    if (typeof w.$m === 'function') {
        w.$m({ MethodName: 'QueryPlatform', Keyword: '', ActiveFlag: 'Y', Page: 1, Rows: 200 }, (txt) => {
            console.log('QueryPlatform resp =', String(txt).substring(0, 200));
        });
    }
    setTimeout(() => {
        console.log('T.domain rows =', w.T && w.T.domain ? w.T.domain.rows.length : 'no T.domain');
        console.log('#tblDomain tr =', w.jQuery('#tblDomain tbody tr').length);
        process.exit(0);
    }, 300);
}, 400);
