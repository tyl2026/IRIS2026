# -*- coding: utf-8 -*-
"""诊断：打开一周周报页，生成后 dump 页面实际内容（找内容检查选择器）"""
import asyncio, os
from playwright.async_api import async_playwright

LOGIN_URL = "https://xt.imedway.com/ylxt/Login.aspx"
WEEKLY_URL = "https://xt.imedway.com/ylxt/WeekReport/UIWeeklyReport.aspx"
WEEK = "2026-08-03"


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.goto(LOGIN_URL, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(1000)
        if "Login" in page.url or "login" in page.url.lower():
            print("请扫码登录...")
            for i in range(120):
                await asyncio.sleep(1)
                if "Login" not in page.url and "login" not in page.url.lower():
                    print("已登录")
                    break

        url = f"{WEEKLY_URL}?modefiytime={WEEK}"
        await page.goto(url, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(2500)

        # 按钮状态
        btns = await page.evaluate("""() => {
            function vis(id) {
                var el = document.getElementById(id);
                if (!el) return false;
                var s = el.style.display;
                if (s === 'none') return false;
                var p = el;
                while (p) { if (p.style && p.style.display === 'none') return false; p = p.parentElement; }
                return true;
            }
            return {creat: vis('BtnCreat'), reCreat: vis('BtnReCreat'), submit: vis('BtnSubmit')};
        }""")
        print(f"buttons: {btns}")

        # 生成
        if btns['creat']:
            await page.evaluate("() => { document.getElementById('BtnCreat').click(); }")
            await page.wait_for_timeout(2000)
            # 关弹框
            await page.evaluate("""() => {
                var mw = document.querySelector('.messager-window');
                if (mw && mw.offsetParent !== null) {
                    var btn = mw.querySelector('.messager-button a.l-btn');
                    if (btn) btn.click();
                }
            }""")
            await page.wait_for_timeout(2000)

        # dump 所有 input/textarea 的 id 和值（主页）
        print("\n==== inputs/textareas (main page) ====")
        fields = await page.evaluate("""() => {
            var out = [];
            var els = document.querySelectorAll('input,textarea');
            for (var i = 0; i < els.length; i++) {
                var e = els[i];
                var id = e.id || '';
                var v = e.value || '';
                if (id || v) out.push({id: id, tag: e.tagName, type: e.type || '', value: v.substring(0, 200)});
            }
            return out;
        }""")
        for f in fields:
            print(f"  [{f['tag']}/{f['type']}] id={f['id']!r} value={f['value']!r}")

        # dump iframe 里的 input/textarea
        print("\n==== iframes content ====")
        iframes = await page.evaluate("""() => {
            var out = [];
            var fs = document.querySelectorAll('iframe');
            for (var k = 0; k < fs.length; k++) {
                try {
                    var doc = fs[k].contentDocument || fs[k].contentWindow.document;
                    var els = doc.querySelectorAll('input,textarea');
                    var rows = [];
                    for (var i = 0; i < els.length; i++) {
                        var e = els[i];
                        var id = e.id || '';
                        var v = e.value || '';
                        if (id || v) rows.push({id: id, tag: e.tagName, value: v.substring(0, 200)});
                    }
                    out.push({iframe: k, count: rows.length, rows: rows});
                } catch(e) { out.push({iframe: k, error: String(e)}); }
            }
            return out;
        }""")
        for fr in iframes:
            print(f"  iframe {fr.get('iframe')}: {fr.get('count', fr.get('error'))}")
            for r in fr.get('rows', []):
                print(f"    [{r['tag']}] id={r['id']!r} value={r['value']!r}")

        # datagrid 行
        print("\n==== ListTable datagrid ====")
        grid = await page.evaluate("""() => {
            try {
                var dg = $('#ListTable').datagrid('getData');
                if (!dg || !dg.rows) return {count: 0};
                var first = dg.rows[0] || {};
                var keys = Object.keys(first);
                var sample = {};
                for (var i = 0; i < keys.length; i++) { sample[keys[i]] = String(first[keys[i]]).substring(0, 80); }
                return {count: dg.rows.length, columns: keys, firstRow: sample};
            } catch(e) { return {error: String(e)}; }
        }""")
        print(f"  {grid}")

        # 截图
        shot = os.path.join(os.path.dirname(os.path.abspath(__file__)), "diag_weekly.png")
        await page.screenshot(path=shot)
        print(f"\nscreenshot: {shot}")

        await asyncio.sleep(8)
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
