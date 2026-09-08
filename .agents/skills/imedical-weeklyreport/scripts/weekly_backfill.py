# -*- coding: utf-8 -*-
"""
周报自动补交 - Playwright
流程: 登录 → 逐周补交(选日期→生成→提交)
每月10号截止补交上月周报；禁止提交本周及之后的周报（脚本自动过滤）
"""
import asyncio
from playwright.async_api import async_playwright
from datetime import date, timedelta

LOGIN_URL = "https://xt.imedway.com/ylxt/Login.aspx"
WEEKLY_URL = "https://xt.imedway.com/ylxt/WeekReport/UIWeeklyReport.aspx"

# ============ 配置：需要补交的周列表 ============
# 每项: (该周内任意一个日期, 描述)
# 自动从日报内容推导需要补交的周
WEEKS_TO_BACKFILL = [
    # 格式: ("2026-04-06", "4月第1周"),
    # 从日报内容文件自动生成
]


def generate_weeks_from_dates(dates):
    """从日期列表推导需要补交的周（每周一）"""
    weeks = set()
    for d in dates:
        dt = date.fromisoformat(d)
        monday = dt - timedelta(days=dt.weekday())
        weeks.add(monday.isoformat())
    return sorted(weeks)


async def wait_for_login(page):
    """等待登录"""
    for i in range(120):
        await asyncio.sleep(1)
        url = page.url
        if "Login" not in url and "login" not in url.lower():
            return True
    return False


async def dismiss_dialog(page, timeout=3):
    """自动关闭弹出的提示框/确认框，返回是否执行了操作"""
    for i in range(timeout * 2):
        result = await page.evaluate("""() => {
            // 1. 关闭 messager 提示框 (生成成功/提交成功)
            var mw = document.querySelector('.messager-window');
            if (mw && mw.offsetParent !== null) {
                var btn = mw.querySelector('.messager-button a.l-btn');
                if (btn) { btn.click(); return 'messager'; }
            }
            // 2. 查找"提交周报"审批窗口中的"提交"按钮
            var panels = document.querySelectorAll('.panel.window');
            for (var i = 0; i < panels.length; i++) {
                var p = panels[i];
                if (p.offsetParent === null) continue;
                var title = p.querySelector('.panel-title');
                if (title && title.textContent.indexOf('提交周报') >= 0) {
                    // 找到提交周报窗口，点击"提交"按钮
                    var btns = p.querySelectorAll('a.l-btn');
                    for (var j = 0; j < btns.length; j++) {
                        if (btns[j].textContent.trim() === '提交') {
                            btns[j].click();
                            return 'submit_approval';
                        }
                    }
                }
            }
            // 3. 通用：点击任何可见弹窗中的确认/确定按钮
            var allWindows = document.querySelectorAll('.window,.messager-window,.easyui-dialog');
            for (var k = 0; k < allWindows.length; k++) {
                var w = allWindows[k];
                if (w.offsetParent === null) continue;
                var btns = w.querySelectorAll('a.l-btn');
                for (var j = 0; j < btns.length; j++) {
                    var t = btns[j].textContent.trim();
                    if (t === '确定' || t === '确认' || t === '提交' || t === '是') {
                        btns[j].click();
                        return 'btn_' + t;
                    }
                }
            }
            return 'none';
        }""")
        if result != 'none':
            return result
        await page.wait_for_timeout(500)
    return 'timeout'


async def wait_for_datagrid(page, timeout=10):
    """等待数据表格加载完成"""
    for i in range(timeout * 2):
        count = await page.evaluate("""() => {
            try {
                var dg = $('#ListTable').datagrid('getData');
                return dg && dg.rows ? dg.rows.length : 0;
            } catch(e) { return 0; }
        }""")
        if count > 0:
            return count
        await page.wait_for_timeout(500)
    return 0


async def do_one_week(page, week_date, desc):
    """补交一周的周报"""
    url = f"{WEEKLY_URL}?modefiytime={week_date}"
    print(f"\n[{desc}] {week_date}")

    await page.goto(url, wait_until="networkidle", timeout=30000)
    await page.wait_for_timeout(2500)

    # 检查按钮状态
    btns = await page.evaluate("""() => {
        function vis(id) {
            var el = document.getElementById(id);
            if (!el) return false;
            var s = el.style.display;
            if (s === 'none') return false;
            var p = el;
            while (p) {
                if (p.style && p.style.display === 'none') return false;
                p = p.parentElement;
            }
            return true;
        }
        return {creat: vis('BtnCreat'), reCreat: vis('BtnReCreat'), submit: vis('BtnSubmit')};
    }""")

    if not btns['creat'] and not btns['reCreat']:
        # 可能已有空记录被提交,检查是否还有 BtnSubmit 可见且有实际内容
        if btns['submit']:
            rows = await wait_for_datagrid(page)
            if rows == 0:
                print("  已有空记录,无数据行,跳过(避免重复提交空内容)")
                return 'skip'
            # 有数据行,继续提交
            print(f"  已有记录({rows}行),直接进入提交流程")
        else:
            print("  无法确定状态(所有按钮不可见),跳过")
            return 'skip'

    # ==== Step 1: 生成周报 ====
    if btns['creat']:
        print("  生成周报...")
        await page.evaluate("() => { document.getElementById('BtnCreat').click(); }")
        await page.wait_for_timeout(2000)
        # 关闭"生成成功"弹框
        await dismiss_dialog(page)
        await page.wait_for_timeout(1000)
        # 等待数据加载
        rows = await wait_for_datagrid(page)
        print(f"  数据行数: {rows}")
        if rows == 0:
            msg = await page.evaluate("""() => {
                var m = document.querySelector('.messager-body');
                return m ? m.textContent.trim() : '';
            }""")
            if "已生成" in str(msg) or "exist" in str(msg).lower():
                print("  已生成过")
                await dismiss_dialog(page)
            else:
                print("  ERROR: No weekly report content generated!")
                print("  Please submit daily reports first on 协同网.")
                print("  Skipping this week.")
                return 'skip'
    else:
        print("  周报已生成")
        rows = await wait_for_datagrid(page)
        print(f"  数据行数: {rows}")
        if rows == 0:
            print("  WARNING: Existing weekly report has no data rows.")
            print("  Please submit daily reports first on 协同网.")
            return 'skip'

    # ==== 提交前校验: 内容非空（内容在 ListTable 数据行的字段里，如 SWI_ITEM2） ====
    content_check = await page.evaluate("""() => {
        try {
            var dg = $('#ListTable').datagrid('getData');
            if (!dg || !dg.rows) return {hasContent: false};
            var totalLen = 0;
            for (var i = 0; i < dg.rows.length; i++) {
                var r = dg.rows[i];
                for (var k in r) {
                    if (typeof r[k] === 'string') totalLen += r[k].length;
                }
            }
            return {hasContent: totalLen > 0, totalLen: totalLen, rows: dg.rows.length};
        } catch(e) { return {hasContent: false}; }
    }""")
    has_content = content_check.get('hasContent') or False
    print(f"  内容校验: 数据行={content_check.get('rows', '?')}, 内容长度={content_check.get('totalLen', 0)}")
    if not has_content:
        print("  SKIP: 周报内容为空,避免提交空记录")
        print("  请先在协同网提交日报,或手动填写周报内容")
        return 'skip'

    # ==== Step 2: 提交周报 (4步: 主页BtnSubmit→审批弹窗BtnSubmit→确认→完成) ====
    if btns['submit'] or btns['reCreat']:
        print("  1.点击提交周报(BtnSubmit)...")
        await page.evaluate("() => { document.getElementById('BtnSubmit').click(); }")
        await page.wait_for_timeout(2000)

        # 步骤2: 审批弹窗中点击提交(BtnSubmit)
        # 审批弹窗可能是新iframe或同页面window
        r2 = await page.evaluate("""() => {
            // 先尝试在当前页找审批弹窗中的提交按钮
            var allWindows = document.querySelectorAll('.window,.panel');
            for (var i = 0; i < allWindows.length; i++) {
                var w = allWindows[i];
                if (w.offsetParent === null) continue;
                var btns = w.querySelectorAll('a.l-btn');
                for (var j = 0; j < btns.length; j++) {
                    if (btns[j].textContent.trim() === '提交') {
                        btns[j].click(); return 'found_submit';
                    }
                }
            }
            // 检查是否有新iframe
            var iframes = document.querySelectorAll('iframe');
            for (var k = 0; k < iframes.length; k++) {
                try {
                    var doc = iframes[k].contentDocument || iframes[k].contentWindow.document;
                    var btns = doc.querySelectorAll('a.l-btn');
                    for (var j = 0; j < btns.length; j++) {
                        if (btns[j].textContent.trim() === '提交') {
                            btns[j].click(); return 'found_iframe';
                        }
                    }
                } catch(e) {}
            }
            // fallback: 直接再点 BtnSubmit
            var bs = document.getElementById('BtnSubmit');
            if (bs && bs.offsetParent !== null) { bs.click(); return 'fallback_bs'; }
            return 'not_found';
        }""")
        print(f"  2.审批弹窗提交: {r2}")
        await page.wait_for_timeout(2000)

        # 步骤3+4: iframe 内的确认弹框 "不能修改" → 确定 → 等待 → "提交完成" → 确定
        r3 = await page.evaluate("""() => {
            function findInDoc(doc) {
                var msgs = doc.querySelectorAll('.messager-window');
                for (var i = 0; i < msgs.length; i++) {
                    var m = msgs[i];
                    if (m.offsetParent === null) continue;
                    var body = m.querySelector('.messager-body');
                    if (body && body.textContent.indexOf('不能修改') >= 0) {
                        var btns = m.querySelectorAll('.messager-button a.l-btn');
                        for (var j = 0; j < btns.length; j++) {
                            if (btns[j].textContent.trim() === '确定') { btns[j].click(); return true; }
                        }
                    }
                }
                return false;
            }
            // 先查主页面
            if (findInDoc(document)) return 'main';
            // 再查所有iframe
            var iframes = document.querySelectorAll('iframe');
            for (var k = 0; k < iframes.length; k++) {
                try {
                    var doc = iframes[k].contentDocument || iframes[k].contentWindow.document;
                    if (findInDoc(doc)) return 'iframe' + k;
                } catch(e) {}
            }
            return 'not_found';
        }""")
        print(f"  3.确认弹框: {r3}")
        await page.wait_for_timeout(1500)

        r4 = await page.evaluate("""() => {
            function findInDoc(doc) {
                var msgs = doc.querySelectorAll('.messager-window');
                for (var i = 0; i < msgs.length; i++) {
                    var m = msgs[i];
                    if (m.offsetParent === null) continue;
                    var body = m.querySelector('.messager-body');
                    if (body && body.textContent.indexOf('提交完成') >= 0) {
                        var btns = m.querySelectorAll('.messager-button a.l-btn');
                        for (var j = 0; j < btns.length; j++) {
                            if (btns[j].textContent.trim() === '确定') { btns[j].click(); return true; }
                        }
                    }
                }
                // fallback: 任何messager弹框的确定按钮
                for (var k = 0; k < msgs.length; k++) {
                    var m = msgs[k];
                    if (m.offsetParent === null) continue;
                    var btns = m.querySelectorAll('.messager-button a.l-btn');
                    if (btns.length > 0) { btns[0].click(); return true; }
                }
                return false;
            }
            if (findInDoc(document)) return 'main';
            var iframes = document.querySelectorAll('iframe');
            for (var k = 0; k < iframes.length; k++) {
                try {
                    var doc = iframes[k].contentDocument || iframes[k].contentWindow.document;
                    if (findInDoc(doc)) return 'iframe' + k;
                } catch(e) {}
            }
            return 'not_found';
        }""")
        print(f"  4.完成弹框: {r4}")

        return 'ok'
    else:
        print("  提交按钮不可见")
        return 'fail'


def get_month_weeks(year, month):
    """获取指定年月的所有周一日期"""
    first_day = date(year, month, 1)
    if month == 12:
        last_day = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        last_day = date(year, month + 1, 1) - timedelta(days=1)
    weeks = []
    d = first_day
    while d <= last_day:
        if d.weekday() == 0:
            weeks.append(d.isoformat())
        d += timedelta(days=1)
    return weeks


def get_last_month_weeks():
    """获取上月所有周的周一日期"""
    today = date.today()
    if today.month == 1:
        last_month = date(today.year - 1, 12, 1)
    else:
        last_month = date(today.year, today.month - 1, 1)
    first_day = last_month
    if last_month.month == 12:
        last_day = date(last_month.year + 1, 1, 1) - timedelta(days=1)
    else:
        last_day = date(last_month.year, last_month.month + 1, 1) - timedelta(days=1)
    weeks = []
    d = first_day
    while d <= last_day:
        if d.weekday() == 0:
            weeks.append(d.isoformat())
        d += timedelta(days=1)
    return weeks


def get_year_weeks(year):
    """获取指定年份所有周的周一日期（截止到当前日期）"""
    today = date.today()
    first_day = date(year, 1, 1)
    last_day = today  # 不补交未来日期
    weeks = []
    d = first_day
    while d <= last_day:
        if d.weekday() == 0:
            weeks.append(d.isoformat())
        d += timedelta(days=1)
    return weeks


def filter_past_weeks(weeks):
    """禁止提交本周及之后的周报：只保留已过去的周（周一日期 < 本周一）"""
    today = date.today()
    current_monday = today - timedelta(days=today.weekday())
    return [w for w in weeks if date.fromisoformat(w) < current_monday]


async def main():
    import sys as _sys, os as _os
    _sys.path.insert(0, _os.path.dirname(_os.path.abspath(__file__)))
    from submit_log import get_pending_weekly, mark_weekly_done

    print("Weekly Report Backfill")
    print("=" * 40)

    # 参数: --date YYYY-MM-DD | --month YYYY-MM | --year YYYY | 默认上月
    args = _sys.argv[1:] if len(_sys.argv) > 1 else []
    if '--date' in args:
        idx = args.index('--date')
        d = args[idx + 1] if idx + 1 < len(args) else ""
        dt = date.fromisoformat(d)
        monday = dt - timedelta(days=dt.weekday())
        weeks = [monday.isoformat()]
        print(f"Single week: {weeks[0]}")
    elif '--year' in args:
        idx = args.index('--year')
        year = int(args[idx + 1]) if idx + 1 < len(args) else date.today().year
        weeks = get_year_weeks(year)
        print(f"Year {year} weeks ({len(weeks)}): {weeks[0]} ~ {weeks[-1]}")
    elif '--month' in args:
        idx = args.index('--month')
        month_str = args[idx + 1] if idx + 1 < len(args) else ""
        parts = month_str.split('-')
        if len(parts) == 2:
            y, m = int(parts[0]), int(parts[1])
        else:
            y, m = date.today().year, int(parts[0])
        weeks = get_month_weeks(y, m)
        print(f"Month {y}-{m:02d} weeks ({len(weeks)}): {weeks[0] if weeks else 'none'} ~ {weeks[-1] if weeks else 'none'}")
    else:
        weeks = get_last_month_weeks()
        print(f"Last month weeks ({len(weeks)}): {weeks[0]} ~ {weeks[-1]}")

    # 禁止提交本周及之后的周报（只保留已过去的周）
    kept = filter_past_weeks(weeks)
    removed = [w for w in weeks if w not in kept]
    if removed:
        print(f"Excluded current/future weeks (not allowed): {', '.join(removed)}")
    weeks = kept
    if not weeks:
        print("No past weeks to backfill; current and future weeks are not allowed")
        return

    # 过滤日志中已提交的
    pending = get_pending_weekly(weeks)
    already = [w for w in weeks if w not in pending]
    if already:
        print(f"Already done (from log): {len(already)}")
    if not pending:
        print("All weeks already submitted!")
        return
    print(f"To backfill: {len(pending)} weeks")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        ctx = await browser.new_context(viewport={"width": 1280, "height": 900})
        page = await ctx.new_page()

        # 登录
        await page.goto(LOGIN_URL, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(1000)
        if "Login" in page.url or "login" in page.url.lower():
            if not await wait_for_login(page):
                print("Login timeout!")
                await browser.close()
                return
            await page.wait_for_timeout(2000)

        # 逐周补交
        ok = 0
        skip = 0
        fail = 0
        for i, week_date in enumerate(pending):
            desc = f"Week {i+1}/{len(pending)}"
            result = await do_one_week(page, week_date, desc)
            if result == 'ok' or result == 'done':
                mark_weekly_done(week_date)
                ok += 1
            elif result == 'skip':
                skip += 1
            else:
                fail += 1
            if i < len(pending) - 1:
                await page.wait_for_timeout(1000)

        print(f"\nDone: {ok} ok, {skip} skip, {fail} fail / {len(pending)} total")
        if ok > 0:
            print(f"Log saved: {_os.path.join(_os.path.dirname(_os.path.abspath(__file__)), 'submit_log.json')}")
        print("Browser stays open for 30s...")
        await asyncio.sleep(30)
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
