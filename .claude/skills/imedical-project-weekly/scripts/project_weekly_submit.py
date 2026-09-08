# -*- coding: utf-8 -*-
"""
项目周报自动补交 + 内容生成
1. 从日报内容生成项目周报（本周已完成/未完成 + 下周计划）
2. 自动提交到协同网项目周报系统
每月6号截止补交上月
"""
import asyncio, re, os, sys
from datetime import date, timedelta
from collections import defaultdict
from playwright.async_api import async_playwright

# 自动检测项目根目录
_script_dir = os.path.dirname(os.path.abspath(__file__))
_project_root = _script_dir
for _ in range(10):
    if os.path.exists(os.path.join(_project_root, "CLAUDE.md")):
        break
    _project_root = os.path.dirname(_project_root)
CONTENT_FILE = os.path.join(_project_root, "日报提交", "日报内容.txt")
no_submit = False
LOGIN_URL = "https://xt.imedway.com/ylxt/Login.aspx"
PROJ_REPORT_URL = "https://xt.imedway.com/ylxt/WeekReportPM/UIProjectReport.aspx"

# ============ 下周工作计划（手动维护） ============
NEXT_WEEK_PLANS = [
    "追溯码申报问题排查处理",
    "医保智能审核部署联调",
    "传染病监测数据质量提升",
    "工伤医保升级",
    "三医数据采集质量提升",
]


# ============ 内容生成（复用 gen_weekly_report 逻辑） ============

def parse_daily_reports():
    reports = {}
    current_date = None
    if not os.path.exists(CONTENT_FILE):
        return reports
    with open(CONTENT_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line: continue
            m = re.match(r'^(\d{8,9})$', line)
            if m:
                raw = m.group(1)
                if len(raw) == 9 and raw.startswith('2026'): raw = raw[:6] + raw[7:]
                elif raw.startswith('2024') and len(raw) == 8: raw = '2026' + raw[4:]
                current_date = f'{raw[:4]}-{raw[4:6]}-{raw[6:8]}'
                continue
            m = re.match(r'^(\d+)[.\s、]?(.+)', line)
            if m and current_date:
                reports.setdefault(current_date, []).append(m.group(2).strip())
    return reports


def classify_item(item):
    cats = [
        ('医保智能审核', ['医保智能', '医保审核', '3101', '3102', '3103']),
        ('医保电子处方', ['电子处方', '处方流转']),
        ('医保对账', ['医保对账', '大额支付']),
        ('医保飞检', ['医保飞检', '飞检']),
        ('医保', ['医保']),
        ('信用支付', ['信用支付', '线上信用']),
        ('检验检查互认', ['检验检查互认', '互认']),
        ('三医数据', ['三医数据', '三医']),
        ('传染病监测', ['传染病监测', '传染病']),
        ('工伤医保', ['工伤']),
        ('药品追溯码', ['追溯码', '追溯']),
        ('门诊结算', ['门诊结算', '门诊退费', '门诊收费']),
        ('收入报表', ['收入', '统计', '报表']),
        ('超声报告', ['超声报告', '超声']),
        ('排班管理', ['排班']),
        ('体检', ['体检']),
        ('综合查询', ['综合查询']),
        ('输血管理', ['输血', '用血', '血库']),
        ('病案管理', ['病案', '首页']),
        ('产科', ['产科', '婴儿', '生育']),
        ('护理', ['护理', '血栓', 'VTE', '安宁疗护']),
        ('CDR/数据中心', ['CDR', '数据中心', '全息视图', '患者360']),
        ('平台数据', ['平台数据', '省平台', '市平台']),
        ('需求质控', ['需求质控', '质控小组']),
        ('PACS', ['PACS', 'pacs']),
        ('康复', ['康复']),
        ('药品管理', ['药品', '药库', '药房']),
        ('服务器运维', ['服务器', '磁盘', 'DB ', 'mirror', 'journal']),
        ('设备连接', ['仪器', '血气', '摄像头']),
        ('系统UI', ['登录界面', '背景图片']),
        ('叫号系统', ['叫号']),
        ('分级诊疗', ['分级诊疗', '双向转诊']),
        ('微信公众号', ['微信', '公众号']),
        ('主数据管理', ['主数据', 'MDM', 'mdm']),
        ('医师资质', ['医师资质', '资质系统']),
    ]
    for cat, keywords in cats:
        for kw in keywords:
            if kw in item: return cat
    return '其他'


def is_completed(item):
    ongoing = ['处理中', '进行中', '调试中', '排查中', '配置中', '测试中',
               '核对中', '制作中', '沟通中', '升级中', '推进中', '对接中',
               '重传中', '提取中', '联调中', '升级中']
    for m in ongoing:
        if m in item: return False
    if any(m in item for m in ['待更新', '待处理', '待提交', '待测试']): return False
    return True


def generate_weekly_content(monday):
    """从日报生成项目周报内容，返回 (本周内容文本, 下周内容文本)"""
    reports = parse_daily_reports()
    sunday = monday + timedelta(days=6)

    projects = defaultdict(lambda: {'completed': [], 'ongoing': []})
    all_dates = sorted(reports.keys())
    for d_str in all_dates:
        d = date.fromisoformat(d_str)
        if monday <= d <= sunday:
            for item in reports[d_str]:
                proj = classify_item(item)
                if is_completed(item):
                    projects[proj]['completed'].append(item)
                else:
                    projects[proj]['ongoing'].append(item)

    # 去重：去掉状态标记后比较核心内容，相同内容只保留一条
    def dedup(items):
        seen = set()
        unique = []
        for item in items:
            core = re.sub(r'[（(][^)）]*[)）]', '', item).strip()
            if core not in seen:
                seen.add(core)
                unique.append(item)
        return unique

    # 生成本周内容
    this_week = []
    this_week.append("【本周已完成】")
    for proj in sorted(projects.keys()):
        items = dedup(projects[proj]['completed'])
        if items:
            this_week.append(f"■ {proj}")
            for item in items:
                this_week.append(f"  · {item}")
    this_week.append("")
    this_week.append("【本周计划内未完成】")
    has_ongoing = False
    for proj in sorted(projects.keys()):
        items = dedup(projects[proj]['ongoing'])
        if items:
            has_ongoing = True
            this_week.append(f"■ {proj}")
            for item in items:
                this_week.append(f"  · {item}")
    if not has_ongoing:
        this_week.append("  无")

    # 下周内容 = 手动计划 + 本周未完成但未在计划中体现的项
    next_week = []
    for i, plan in enumerate(NEXT_WEEK_PLANS):
        next_week.append(f"{i+1}. {plan}")

    # 收集本周未完成项，排除与手动计划重叠的
    ongoing_core = set()
    for proj in sorted(projects.keys()):
        for item in projects[proj]['ongoing']:
            core = re.sub(r'[（(][^)）]*[)）]', '', item).strip()
            ongoing_core.add(core)

    # 检查ongoing项是否已被手动计划覆盖（同分类匹配）
    def overlaps_with_plans(item_text):
        item_cat = classify_item(item_text)
        for plan in NEXT_WEEK_PLANS:
            if classify_item(plan) == item_cat:
                return True
        return False

    extra = [item for item in ongoing_core if not overlaps_with_plans(item)]
    if extra:
        next_week.append("")
        next_week.append("【本周未完成跟进】")
        for item in extra:
            next_week.append(f"  · {item}")

    return '\n'.join(this_week), '\n'.join(next_week)


# ============ Playwright 自动化 ============

async def wait_for_login(page):
    for i in range(120):
        await asyncio.sleep(1)
        if "Login" not in page.url and "login" not in page.url.lower():
            return True
    return False


async def handle_messager(page, timeout=3):
    """关闭弹框"""
    for i in range(timeout * 2):
        result = await page.evaluate("""() => {
            var msgs = document.querySelectorAll('.messager-window');
            for (var i = 0; i < msgs.length; i++) {
                var m = msgs[i];
                if (m.offsetParent === null) continue;
                var btns = m.querySelectorAll('.messager-button a.l-btn');
                if (btns.length > 0) { btns[0].click(); return 'ok'; }
            }
            return 'none';
        }""")
        if result != 'none': return
        await asyncio.sleep(0.5)


async def submit_one_week(page, monday, desc):
    """补交一周的项目周报"""
    sunday = monday + timedelta(days=6)
    week_label = f"{monday} ~ {sunday}"
    print(f"\n[{desc}] {week_label}")

    # 生成内容
    print("  生成周报内容...")
    this_content, next_content = generate_weekly_content(monday)
    print(f"  本周: {len(this_content)} chars, 下周: {len(next_content)} chars")

    # 本周已完成为空时拒绝提交
    if "【本周已完成】\n\n" in this_content or "【本周已完成】\n【" in this_content:
        print("  ERROR: No completed items this week — refusing to submit empty content.")
        print("  Please provide daily reports first, then retry.")
        return 'skip'

    # 切换到项目周报表单
    url = f"{PROJ_REPORT_URL}?modefiytime={monday.isoformat()}&bjType=bj"
    await page.goto(url, wait_until="networkidle", timeout=30000)
    await page.wait_for_timeout(2500)

    # 检查是否已有周报
    swid = await page.evaluate("""() => {
        var el = document.getElementById('swid');
        return el ? el.value : '0';
    }""")
    if swid and swid != '0':
        # 检查是否已提交
        subm = await page.evaluate("""() => {
            var s = document.getElementById('BtnSubmit');
            return s && s.offsetParent !== null;
        }""")
        if not subm:
            print(f"  周报已存在且已提交 (swid={swid})，跳过")
            return 'skip'
        print(f"  周报已存在 (swid={swid})，补充内容后提交")

    # Step 1: 新建周报（仅 swid=0 时需要）
    if swid == '0':
        print("  1. 新建周报...")
        await page.evaluate("() => { document.getElementById('BtnCreat').click(); }")
        await page.wait_for_timeout(2000)
        await handle_messager(page)
        await page.wait_for_timeout(1000)
    else:
        print("  1. 周报已存在，跳过新建")

    # Step 2: 编辑项目阶段 → 运维阶段
    print("  2. 编辑项目阶段 → 运维阶段...")
    await page.evaluate("() => { document.getElementById('BtnStatus').click(); }")
    await page.wait_for_timeout(4000)
    # Find iframe with stage dropdown
    for f in page.frames:
        try:
            has = await f.evaluate("() => { return !!document.getElementById('DroProType'); }")
            if has:
                await f.evaluate("() => { $('#DroProType').combobox('setValue', '运维阶段'); }")
                await page.wait_for_timeout(500)
                await f.evaluate("() => { document.getElementById('BtnWeeklyStatus').click(); }")
                break
        except: pass
    await page.wait_for_timeout(2000)
    await handle_messager(page)
    await page.wait_for_timeout(1000)

    # Step 3: 添加周报 → 打开 iframe
    print("  3. 添加周报...")
    await page.evaluate("() => { document.getElementById('btnadd').click(); }")
    await page.wait_for_timeout(5000)

    # Step 4: 用 Playwright 原生 frame API 填写 iframe 内表单
    print("  4. 填写内容...")
    # Get the iframe
    frame = page.frame(name='') or page.main_frame
    frames = page.frames
    target_frame = None
    for f in frames:
        try:
            el = await f.evaluate("() => { return !!document.getElementById('txtThisContent'); }")
            if el: target_frame = f; break
        except: pass

    if target_frame:
        # easyui-textbox: must use setValue, not fill
        await target_frame.evaluate("""(data) => {
            $('#txtThisContent').textbox('setValue', data.thisContent);
            $('#txtNextContent').textbox('setValue', data.nextContent);
        }""", {"thisContent": this_content, "nextContent": next_content})
        await page.wait_for_timeout(500)
        await target_frame.click('#btnSave')
        print(f"    内容已填入并点击保存")
    else:
        # Fallback: evaluate with event dispatch
        print("    未找到 iframe，使用 evaluate 方式")
        fill_result = await page.evaluate("""(data) => {
            var iframes = document.querySelectorAll('iframe');
            for (var i = 0; i < iframes.length; i++) {
                try {
                    var doc = iframes[i].contentDocument || iframes[i].contentWindow.document;
                    var t1 = doc.getElementById('txtThisContent');
                    var t2 = doc.getElementById('txtNextContent');
                    if (t1 && t2) {
                        t1.value = data.thisContent;
                        t2.value = data.nextContent;
                        t1.dispatchEvent(new Event('input', {bubbles: true}));
                        t2.dispatchEvent(new Event('input', {bubbles: true}));
                        t1.dispatchEvent(new Event('change', {bubbles: true}));
                        t2.dispatchEvent(new Event('change', {bubbles: true}));
                        // Also sync hidden inputs
                        var inputs = doc.querySelectorAll('input[name=\"txtThisContent\"], input[name=\"txtNextContent\"]');
                        for (var k = 0; k < inputs.length; k++) {
                            if (inputs[k].name === 'txtThisContent') inputs[k].value = data.thisContent;
                            if (inputs[k].name === 'txtNextContent') inputs[k].value = data.nextContent;
                        }
                        var sb = doc.getElementById('btnSave');
                        if (sb) { sb.click(); return 'saved'; }
                        return 'no_save_btn';
                    }
                } catch(e) { return 'error: ' + e.message; }
            }
            return 'no_iframe';
        }""", {"thisContent": this_content, "nextContent": next_content})
        print(f"    evaluate 结果: {fill_result}")

    await page.wait_for_timeout(2500)
    await handle_messager(page)
    await page.wait_for_timeout(1000)

    # Step 5: 提交周报
    if no_submit:
        print("  5. 跳过提交 (--no-submit)")
        print(f"  内容已填充，请手动审核后提交: {PROJ_REPORT_URL}?modefiytime={monday.isoformat()}&bjType=bj")
        return 'filled'
    print("  5. 提交周报...")
    submit_vis = await page.evaluate("""() => {
        var s = document.getElementById('BtnSubmit');
        return s && s.offsetParent !== null;
    }""")
    print(f"    BtnSubmit visible: {submit_vis}")

    if submit_vis:
        await page.evaluate("() => { document.getElementById('BtnSubmit').click(); }")
        await page.wait_for_timeout(2500)
        await handle_messager(page)
        await page.wait_for_timeout(800)
        await handle_messager(page)
        return 'ok'
    else:
        print("    提交按钮不可见，已保存")
        return 'saved'


# ============ Main ============

def get_month_weeks(year, month):
    """获取指定年月的所有周一"""
    first_day = date(year, month, 1)
    if month == 12:
        last_day = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        last_day = date(year, month + 1, 1) - timedelta(days=1)
    weeks = []
    d = first_day
    while d <= last_day:
        if d.weekday() == 0:
            weeks.append(d)
        d += timedelta(days=1)
    return weeks


def get_last_month_weeks():
    """获取上月所有周一"""
    today = date.today()
    if today.month == 1:
        lm = date(today.year - 1, 12, 1)
    else:
        lm = date(today.year, today.month - 1, 1)
    if lm.month == 12:
        last_day = date(lm.year + 1, 1, 1) - timedelta(days=1)
    else:
        last_day = date(lm.year, lm.month + 1, 1) - timedelta(days=1)
    weeks = []
    d = lm
    while d <= last_day:
        if d.weekday() == 0:
            weeks.append(d)
        d += timedelta(days=1)
    return weeks


async def main():
    global no_submit
    # Args: --date YYYY-MM-DD | --month YYYY-MM | --year YYYY | --no-submit | default last month
    args = sys.argv[1:]
    if '--no-submit' in args:
        no_submit = True
        args.remove('--no-submit')
    if '--date' in args:
        idx = args.index('--date')
        d = args[idx + 1] if idx + 1 < len(args) else ""
        dt = date.fromisoformat(d)
        monday = dt - timedelta(days=dt.weekday())
        weeks = [monday]
        print(f"Single week: {weeks[0]}")
    elif '--year' in args:
        idx = args.index('--year')
        year = int(args[idx + 1]) if idx + 1 < len(args) else date.today().year
        today = date.today()
        weeks = []
        d = date(year, 1, 1)
        while d <= today:
            if d.weekday() == 0: weeks.append(d)
            d += timedelta(days=1)
        print(f"Year {year}: {len(weeks)} weeks")
    elif '--month' in args:
        idx = args.index('--month')
        ms = args[idx + 1] if idx + 1 < len(args) else ""
        parts = ms.split('-')
        y, m = (int(parts[0]), int(parts[1])) if len(parts) == 2 else (date.today().year, int(parts[0]))
        weeks = get_month_weeks(y, m)
        print(f"Month {y}-{m:02d}: {len(weeks)} weeks")
    else:
        weeks = get_last_month_weeks()
        print(f"Last month: {len(weeks)} weeks")

    if not weeks:
        print("No weeks to process")
        return

    # Require daily report content — refuse to submit empty project weekly
    daily_reports = parse_daily_reports()
    if not daily_reports:
        print("=" * 50)
        print("ERROR: No daily report content found!")
        print(f"Expected at: {CONTENT_FILE}")
        print("Please provide daily report content first before submitting project weekly.")
        print("=" * 50)
        sys.exit(1)

    # Check log
    log_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "proj_weekly_log.json")
    log = {}
    if os.path.exists(log_file):
        with open(log_file, 'r', encoding='utf-8') as f:
            log = json.load(f)

    pending = [w for w in weeks if w.isoformat() not in log.get('done', {})]
    skipped = len(weeks) - len(pending)
    if skipped:
        print(f"Already done (log): {skipped} weeks")
    if not pending:
        print("All weeks already submitted!")
        return
    print(f"To process: {len(pending)} weeks")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        ctx = await browser.new_context(viewport={"width": 1280, "height": 900})
        page = await ctx.new_page()

        # Login
        await page.goto(LOGIN_URL, wait_until="networkidle", timeout=30000)
        if "Login" in page.url:
            if not await wait_for_login(page):
                print("Login timeout!")
                await browser.close()
                return
            await page.wait_for_timeout(2000)

        ok = skip = fail = 0
        for i, monday in enumerate(pending):
            desc = f"Week {i+1}/{len(pending)}"
            try:
                result = await submit_one_week(page, monday, desc)
                if result == 'ok':
                    log.setdefault('done', {})[monday.isoformat()] = True
                    with open(log_file, 'w', encoding='utf-8') as f:
                        json.dump(log, f, ensure_ascii=False, indent=2)
                    ok += 1
                elif result == 'skip':
                    skip += 1
                else:
                    fail += 1
            except Exception as e:
                print(f"  ERROR: {e}")
                fail += 1
            if i < len(pending) - 1:
                await page.wait_for_timeout(1000)

        print(f"\nDone: {ok} ok, {skip} skip, {fail} fail / {len(pending)}")
        await asyncio.sleep(30)
        await browser.close()

if __name__ == "__main__":
    import json
    asyncio.run(main())
